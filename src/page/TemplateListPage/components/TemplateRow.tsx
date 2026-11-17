import { useId, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { IoArrowForwardSharp } from 'react-icons/io5';
import IconButton from '../../../components/IconButton/IconButton';
import Overlay from '../../../components/Overlay/Overlay';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import {
  DebateTemplate,
  StanceToString,
  TimeBoxInfo,
} from '../../../types/type';
import { decodeDebateTableData } from '../../../util/arrayEncoding';
import { createTemplateShareUrl } from '../../../util/templateShareUrl';
import { Formatting } from '../../../util/formatting';
import { normalizeSpeechTypeKey } from '../../../util/speechType';
import useAnalytics from '../../../hooks/useAnalytics';

interface TemplateRowProps {
  organizationName: string;
  template: DebateTemplate;
}

type PreviewRow = Pick<
  TimeBoxInfo,
  | 'stance'
  | 'speechType'
  | 'boxType'
  | 'time'
  | 'timePerTeam'
  | 'timePerSpeaking'
>;

const ROW_CLASS =
  'relative flex items-center justify-between gap-3 rounded-xl bg-neutral-100 py-2 pr-2 pl-3.5';
const NAME_CLASS =
  'min-w-0 flex-1 rounded-sm py-1 text-left text-ui-body wrap-break-word text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900';

function isDuration(value: unknown): value is number | null {
  return (
    value === null ||
    (typeof value === 'number' && Number.isFinite(value) && value >= 0)
  );
}

function isPreviewRow(value: unknown): value is PreviewRow {
  if (typeof value !== 'object' || value === null) {
    return false;
  }
  return (
    'stance' in value &&
    ['PROS', 'CONS', 'NEUTRAL'].includes(String(value.stance)) &&
    'speechType' in value &&
    typeof value.speechType === 'string' &&
    'boxType' in value &&
    (value.boxType === 'NORMAL' || value.boxType === 'TIME_BASED') &&
    'time' in value &&
    isDuration(value.time) &&
    'timePerTeam' in value &&
    isDuration(value.timePerTeam) &&
    'timePerSpeaking' in value &&
    isDuration(value.timePerSpeaking)
  );
}

/** 미리보기에 필요한 시간표 항목만 검증해 반환함. */
async function decodePreview(data: string): Promise<PreviewRow[] | null> {
  // 로딩 표시를 먼저 그릴 수 있도록 압축 해제를 다음 작업으로 미룸.
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
  try {
    const decoded: unknown = decodeDebateTableData(data);
    if (
      typeof decoded !== 'object' ||
      decoded === null ||
      !('table' in decoded) ||
      !Array.isArray(decoded.table) ||
      !decoded.table.every(isPreviewRow)
    ) {
      return null;
    }
    return decoded.table.map(
      ({
        stance,
        speechType,
        boxType,
        time,
        timePerTeam,
        timePerSpeaking,
      }) => ({
        stance,
        speechType,
        boxType,
        time,
        timePerTeam,
        timePerSpeaking,
      }),
    );
  } catch {
    return null;
  }
}

/**
 * 호버·키보드 포커스·이름 클릭으로 열고 템플릿 행과 오버레이를 마우스가 벗어날 때만 닫음.
 * 첫 열림에서만 디코딩하며 data별 성공·실패 결과를 앱의 Query 캐시에 보존함.
 * 화면 가장자리에 맞춰 위·아래 배치와 너비를 조정하고 긴 표는 내부에서 스크롤함.
 * 토론 시작 링크는 미리보기와 독립적으로 유지하며 잘못된 데이터는 지역 오류로 표시함.
 */
export default function TemplateRow(props: TemplateRowProps) {
  const { organizationName, template } = props;
  const { t } = useTranslation();
  const { trackEvent } = useAnalytics();
  const rootRef = useRef<HTMLDivElement>(null);
  const previewId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState({
    left: 0,
    width: 320,
    maxHeight: 320,
    above: true,
  });
  const preview = useQuery({
    queryKey: ['TemplatePreview', template.data],
    queryFn: () => decodePreview(template.data),
    enabled: isOpen,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    retryOnMount: false,
    throwOnError: false,
  });
  const handleOpen = () => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (rect) {
      const width = Math.min(330, window.innerWidth - 32);
      const below = window.innerHeight - rect.bottom;
      const above = rect.top >= Math.min(360, below);
      setPlacement({
        width,
        above,
        left: Math.max(
          16 - rect.left,
          Math.min(0, window.innerWidth - 16 - rect.left - width),
        ),
        maxHeight: Math.max(
          120,
          Math.min(360, (above ? rect.top : below) - 16),
        ),
      });
    }
    setIsOpen(true);
  };
  const formatTime = (time: number | null, key: string) =>
    time === null
      ? t('미설정')
      : t(key, Formatting.formatSecondsToMinutes(time));

  const totalTime = preview.data?.reduce(
    (sum, row) =>
      sum +
      (row.boxType === 'TIME_BASED'
        ? (row.timePerTeam ?? 0) * 2
        : (row.time ?? 0)),
    0,
  );
  const hasUnsetTime = preview.data?.some((row) =>
    row.boxType === 'TIME_BASED' ? row.timePerTeam === null : row.time === null,
  );
  const STANCE_COLORS = {
    PROS: 'bg-stance-blue',
    CONS: 'bg-stance-red',
    NEUTRAL: 'bg-neutral-400',
  };
  return (
    <div
      ref={rootRef}
      className={ROW_CLASS}
      onPointerEnter={(event) => {
        if (event.pointerType === 'mouse') {
          handleOpen();
        }
      }}
      onPointerLeave={(event) => {
        if (event.pointerType === 'mouse') {
          setIsOpen(false);
        }
      }}
      onFocus={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          handleOpen();
        }
      }}
    >
      <button
        type="button"
        className={NAME_CLASS}
        aria-label={t('{{name}} 시간표 미리보기', { name: template.name })}
        aria-expanded={isOpen}
        aria-controls={isOpen ? previewId : undefined}
        onClick={handleOpen}
      >
        {template.name}
      </button>
      <IconButton
        href={createTemplateShareUrl(organizationName, template)}
        variant="secondary"
        shape="circle"
        className="size-[32px]"
        icon={<IoArrowForwardSharp aria-hidden />}
        aria-label={t('{{label}} 토론하기', { label: template.name })}
        onClick={() =>
          trackEvent('template_selected', {
            organization_name: organizationName,
            template_name: template.name,
            template_label: `${organizationName} - ${template.name}`,
          })
        }
      />
      <Overlay
        isOpen={isOpen}
        direction={placement.above ? 'up' : 'down'}
        id={previewId}
        role="region"
        aria-label={t('{{name}} 시간표 미리보기', { name: template.name })}
        className="absolute z-40 overflow-y-auto text-ui-caption text-neutral-900"
        style={{
          left: placement.left,
          width: placement.width,
          maxHeight: placement.maxHeight,
          ...(placement.above ? { bottom: '100%' } : { top: '100%' }),
        }}
      >
        <div className="mb-3 flex flex-col gap-1">
          <span className="text-ui-label wrap-break-word">{template.name}</span>
          {totalTime !== undefined && (
            <span className="text-neutral-500">
              {hasUnsetTime
                ? t('총 시간 미설정')
                : t(
                    '총 {{minutes}}분 {{seconds}}초',
                    Formatting.formatSecondsToMinutes(totalTime),
                  )}
            </span>
          )}
        </div>
        {preview.isPending ? (
          <div className="flex justify-center py-6">
            <LoadingSpinner size="size-8" />
          </div>
        ) : preview.isError || preview.data === null ? (
          <p>{t('시간표 미리보기를 불러오지 못했어요.')}</p>
        ) : preview.data.length === 0 ? (
          <p>{t('등록된 순서가 없어요.')}</p>
        ) : (
          <table
            aria-label={t('{{name}} 시간표 미리보기', { name: template.name })}
            className="w-full border-collapse text-left"
          >
            <tbody>
              {preview.data.map((row, index) => {
                const speechName = t(
                  normalizeSpeechTypeKey(row.speechType) ?? row.speechType,
                );
                return (
                  <tr key={index} className="border-t border-neutral-200">
                    <td className="w-5 py-2 pr-2 align-middle">
                      <span
                        className={[
                          'block size-2 rounded-full',
                          row.boxType === 'TIME_BASED'
                            ? 'bg-brand'
                            : STANCE_COLORS[row.stance],
                        ].join(' ')}
                        aria-hidden="true"
                      />
                      <span className="sr-only">
                        {t(StanceToString[row.stance])}
                      </span>
                    </td>
                    <td className="w-full max-w-0 py-2 pr-2 align-middle">
                      <span className="block truncate" title={speechName}>
                        {speechName}
                      </span>
                    </td>
                    <td className="py-2 text-right align-middle whitespace-nowrap tabular-nums">
                      {row.boxType === 'TIME_BASED'
                        ? row.timePerSpeaking === null
                          ? formatTime(
                              row.timePerTeam,
                              '팀당 {{minutes}}분 {{seconds}}초',
                            )
                          : t('팀당 {{team}} · 발언당 {{speaking}}', {
                              team:
                                row.timePerTeam === null
                                  ? t('미설정')
                                  : Formatting.formatSecondsToMMSS(
                                      row.timePerTeam,
                                    ),
                              speaking:
                                row.timePerSpeaking === null
                                  ? t('제한 없음')
                                  : Formatting.formatSecondsToMMSS(
                                      row.timePerSpeaking,
                                    ),
                            })
                        : formatTime(row.time, '{{minutes}}분 {{seconds}}초')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Overlay>
    </div>
  );
}
