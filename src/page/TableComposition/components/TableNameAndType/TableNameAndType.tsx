import { useTranslation } from 'react-i18next';
import ClearableInput from '../../../../components/ClearableInput/ClearableInput';
import HeaderTitle from '../../../../components/HeaderTitle/HeaderTitle';
import DefaultLayout from '../../../../layout/defaultLayout/DefaultLayout';
import { DebateInfo, StanceToString } from '../../../../type/type';
import useDebounce from '../../../../hooks/useDebounce';
import {
  TABLE_FIELD_LIMITS,
  VALIDATION_DEBOUNCE_MS,
  validateAgenda,
  validateTableName,
  validateTeamName,
} from '../../../../util/tableValidation';

interface TableNameAndTypeProps {
  info: DebateInfo;
  isLoading: boolean;
  isEdit?: boolean;
  onInfoChange: (newInfo: DebateInfo) => void;
  onButtonClick: () => void;
}

export default function TableNameAndType(props: TableNameAndTypeProps) {
  const { t } = useTranslation();
  const {
    info,
    isEdit = false,
    onInfoChange,
    isLoading,
    onButtonClick,
  } = props;

  // 입력이 멈췄다고 판단(디바운스)되면 각 필드를 검증해 붉은 테두리로 노출한다.
  const debouncedName = useDebounce(info.name ?? '', VALIDATION_DEBOUNCE_MS);
  const debouncedAgenda = useDebounce(
    info.agenda ?? '',
    VALIDATION_DEBOUNCE_MS,
  );
  const debouncedProsTeamName = useDebounce(
    info.prosTeamName ?? '',
    VALIDATION_DEBOUNCE_MS,
  );
  const debouncedConsTeamName = useDebounce(
    info.consTeamName ?? '',
    VALIDATION_DEBOUNCE_MS,
  );

  const nameError = validateTableName(debouncedName) !== null;
  const agendaError = validateAgenda(debouncedAgenda) !== null;
  const prosTeamNameError = validateTeamName(debouncedProsTeamName) !== null;
  const consTeamNameError = validateTeamName(debouncedConsTeamName) !== null;

  const handleFieldChange = <K extends keyof DebateInfo>(
    field: K,
    value: DebateInfo[K],
  ) => {
    onInfoChange({
      ...info,
      [field]: value,
    } as DebateInfo);
  };

  const clearField = (field: 'name' | 'agenda') => {
    onInfoChange({
      ...info,
      [field]: '',
    });
  };

  const clearTeamNameField = (field: 'prosTeamName' | 'consTeamName') => {
    onInfoChange({
      ...info,
      [field]: '',
    });
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <HeaderTitle
            title={t('토론 정보를 {{val0}}해주세요', {
              val0: isEdit ? t('수정') : t('설정'),
            })}
          />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <section className="mx-auto grid w-full max-w-4xl grid-cols-[180px_1fr] gap-x-4 gap-y-12 p-6 md:p-8">
          <label className="flex items-center text-base font-semibold md:text-2xl">
            {t('토론 시간표 이름')}
          </label>
          <ClearableInput
            value={t(info.name)}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            onClear={() => clearField('name')}
            placeholder={t('시간표 1')}
            disabled={isLoading}
            isError={nameError}
            maxCount={TABLE_FIELD_LIMITS.name}
          />

          <label className="flex items-center text-base font-semibold md:text-2xl">
            {t('토론 주제')}
          </label>
          <ClearableInput
            value={t(info.agenda)}
            onChange={(e) => handleFieldChange('agenda', e.target.value)}
            onClear={() => clearField('agenda')}
            placeholder={t('토론 주제를 입력해주세요')}
            disabled={isLoading}
            isError={agendaError}
            maxCount={TABLE_FIELD_LIMITS.agenda}
          />

          <>
            <label className="flex items-center text-base font-semibold md:text-2xl">
              {t('팀명')}
            </label>
            <div className="flex items-center gap-8">
              <ClearableInput
                value={t(info.prosTeamName) || ''}
                onChange={(e) =>
                  onInfoChange({
                    ...info,
                    prosTeamName: e.target.value,
                  })
                }
                onClear={() => clearTeamNameField('prosTeamName')}
                placeholder={t(StanceToString['PROS'])}
                disabled={isLoading}
                isError={prosTeamNameError}
                maxCount={TABLE_FIELD_LIMITS.teamName}
              />

              <span>vs.</span>
              <ClearableInput
                value={t(info.consTeamName) || ''}
                onChange={(e) =>
                  onInfoChange({
                    ...info,
                    consTeamName: e.target.value,
                  })
                }
                onClear={() => clearTeamNameField('consTeamName')}
                placeholder={t(StanceToString['CONS'])}
                disabled={isLoading}
                isError={consTeamNameError}
                maxCount={TABLE_FIELD_LIMITS.teamName}
              />
            </div>
          </>
        </section>
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-8 w-full max-w-4xl">
          <button
            disabled={isLoading}
            onClick={() => {
              // 제출 시점에 현재값(디바운스 미반영분 포함)으로 전체 필드를 재검증한다.
              // 위반이 있으면 진행을 막고, 붉은 테두리·카운터에 더해 무엇이 잘못됐는지
              // 사유별 메시지로 알려준다.
              const errors: string[] = [];

              const nameReason = validateTableName(info.name ?? '');
              if (nameReason === 'LENGTH') {
                errors.push(
                  t('시간표 이름은 최대 {{val0}}자까지 입력할 수 있습니다.', {
                    val0: TABLE_FIELD_LIMITS.name,
                  }),
                );
              } else if (nameReason === 'FORM') {
                errors.push(
                  t('시간표 이름에 사용할 수 없는 문자가 포함되어 있습니다.'),
                );
              }

              const agendaReason = validateAgenda(info.agenda ?? '');
              if (agendaReason === 'LENGTH') {
                errors.push(
                  t('토론 주제는 최대 {{val0}}자까지 입력할 수 있습니다.', {
                    val0: TABLE_FIELD_LIMITS.agenda,
                  }),
                );
              }

              const prosReason = validateTeamName(info.prosTeamName ?? '');
              const consReason = validateTeamName(info.consTeamName ?? '');
              if (prosReason === 'LENGTH' || consReason === 'LENGTH') {
                errors.push(t('팀명은 최대 15자까지 입력할 수 있습니다.'));
              }
              if (prosReason === 'FORM' || consReason === 'FORM') {
                errors.push(
                  t('팀명에 사용할 수 없는 문자가 포함되어 있습니다.'),
                );
              }

              if (errors.length > 0) {
                alert(errors.join('\n'));
                return;
              }

              const updatedInfo = {
                ...info,
                name: info.name || t('시간표 1'),
                prosTeamName: info.prosTeamName || t('찬성'),
                consTeamName: info.consTeamName || t('반대'),
              };

              onInfoChange(updatedInfo);
              onButtonClick();
            }}
            className="button enabled brand w-full rounded-full"
          >
            {t('다음')}
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
