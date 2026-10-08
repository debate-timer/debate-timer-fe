import { useTranslation } from 'react-i18next';
import { useId } from 'react';
import MegaphoneAsset from './MegaphoneAsset';
import NoticeAsset from './NoticeAsset';
import {
  isPredefinedPatchNote,
  PatchNoteData,
} from '../../constants/patch_note';
import { DEFAULT_LANG, isSupportedLang } from '../../util/languageRouting';
import DTCheck from '../icons/Check';
import clsx from 'clsx';

// 모바일에서는 상하좌우 16px 여백 안에 정사각형 전체가 들어오도록 함.
const MOBILE_MODAL_CLASS =
  'size-[min(calc(100vw-32px),calc(100dvh-32px))] md:h-auto';
// 데스크탑의 predefined 모드는 기존 정사각형 배치를 유지함.
const PREDEFINED_MODAL_CLASS =
  'aspect-square md:w-[clamp(600px,min(47.5vw,90vh),780px)]';
// 데스크탑의 image-only 모드는 이미지의 원래 비율에 따라 높이가 결정됨.
const IMAGE_ONLY_MODAL_CLASS = 'md:w-[clamp(600px,min(47.5vw,80vh),780px)]';
const MAIN_CONTENT_CLASS =
  'flex h-[59.5%] w-full shrink-0 flex-col gap-3 bg-[#EFF0F4] p-[4.5%] md:shrink md:gap-[clamp(36px,2.75vw,44px)]';
const HEADER_CLASS =
  'flex h-12 w-full shrink-0 flex-row items-center gap-[1%] md:h-[clamp(72px,6vh,96px)] md:shrink';
const HEADER_TEXT_CLASS =
  'flex min-w-0 w-full flex-col space-y-2 md:space-y-[clamp(15px,1.25vw,20px)]';
const TEXT_CONTENT_CLASS =
  'flex min-h-0 flex-1 flex-col items-center overflow-y-auto md:h-full md:min-h-[auto] md:flex-[0_1_auto] md:justify-center md:overflow-visible';
const IMAGE_ONLY_CONTENT_CLASS =
  'flex min-h-0 w-full flex-1 flex-col md:min-h-[auto] md:flex-[0_1_auto]';
const IMAGE_ONLY_IMAGE_CONTAINER_CLASS =
  'min-h-0 w-full flex-1 overflow-hidden md:min-h-[auto] md:flex-[0_1_auto] md:overflow-visible';
const CLOSE_BUTTON_CLASS =
  'flex shrink-0 flex-row items-center justify-center bg-brand transition-all hover:bg-brand-hover';

const HIDE_FOR_WEEK_LABEL_CLASS =
  'group flex w-fit cursor-pointer select-none flex-row items-center gap-[clamp(6px,0.5vw,8px)]';
const HIDE_FOR_WEEK_BOX_CLASS =
  'flex size-[clamp(16px,1.25vw,20px)] shrink-0 items-center justify-center rounded-[4px] border transition-colors';
const HIDE_FOR_WEEK_FOCUS_CLASS =
  'peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-focus-visible:ring-offset-1';

interface UpdateModalProps {
  data: PatchNoteData;
  isChecked: boolean;
  onChecked: (value: boolean) => void;
  onClose: () => void;
}

interface HideForWeekCheckboxProps {
  id: string;
  isChecked: boolean;
  onChecked: (value: boolean) => void;
  className?: string;
}

function HideForWeekCheckbox(props: HideForWeekCheckboxProps) {
  const { id, isChecked, onChecked, className = '' } = props;
  const { t } = useTranslation();

  return (
    <label htmlFor={id} className={`${HIDE_FOR_WEEK_LABEL_CLASS} ${className}`}>
      <input
        id={id}
        type="checkbox"
        className="peer sr-only"
        checked={isChecked}
        onChange={(e) => onChecked(e.target.checked)}
      />
      <span
        aria-hidden="true"
        className={`${HIDE_FOR_WEEK_BOX_CLASS} ${HIDE_FOR_WEEK_FOCUS_CLASS} ${
          isChecked
            ? 'border-brand bg-brand'
            : 'border-default-neutral bg-default-white group-hover:border-default-black2'
        }`}
      >
        {isChecked && <DTCheck className="w-[65%] text-default-black" />}
      </span>
      <span
        className={`text-[clamp(12px,0.875vw,14px)] transition-colors ${
          isChecked
            ? 'text-default-black'
            : 'text-default-black2/70 group-hover:text-default-black'
        }`}
      >
        {t('일주일간 보지 않기')}
      </span>
    </label>
  );
}

/** 모바일에서는 화면 여백 안에 정사각형으로, 데스크탑에서는 모드별 비율로 표시함. */
export default function UpdateModal(props: UpdateModalProps) {
  const { data, isChecked, onChecked, onClose } = props;
  const { t, i18n } = useTranslation();
  const titleId = useId();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const primaryLang = currentLang?.split(/[-_]/)[0];
  const lang = isSupportedLang(primaryLang) ? primaryLang : DEFAULT_LANG;
  const isEnglish = lang === 'en';
  const patchNoteImage = isEnglish ? data.imageEn : data.imageKo;
  const isPredefined = isPredefinedPatchNote(data);

  return (
    <div
      role="dialog"
      aria-labelledby={isPredefined ? titleId : undefined}
      aria-label={
        isPredefined
          ? undefined
          : t('디베이트 타이머에 새로운 기능이 생겼어요!')
      }
      className={clsx(
        'flex flex-col overflow-hidden rounded-[2.2%] bg-default-white',
        MOBILE_MODAL_CLASS,
        isPredefined ? PREDEFINED_MODAL_CLASS : IMAGE_ONLY_MODAL_CLASS,
      )}
    >
      {isPredefined ? (
        <>
          {/* 메인 컨텐츠 */}
          <div className={MAIN_CONTENT_CLASS}>
            <div className={HEADER_CLASS}>
              <div className="h-full w-[15.7%] shrink-0">
                <MegaphoneAsset className="h-full w-full md:my-[8px] md:h-[80px] md:w-[93px]" />
              </div>

              <div className={HEADER_TEXT_CLASS}>
                <p className="text-[clamp(12px,0.875vw,14px)] leading-none text-default-black">
                  {t('디베이트 타이머에 새로운 기능이 생겼어요!')}
                </p>

                <div className="w-[37.3%] shrink-0">
                  <NoticeAsset className="h-auto w-full" />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-1 overflow-hidden">
              <img
                src={patchNoteImage}
                alt={t('업데이트 이미지')}
                className="h-full w-full rounded-[0.8%] object-contain"
              />
            </div>
          </div>

          {/* 텍스트 컨텐츠 */}
          <div className="flex min-h-0 w-full flex-1 flex-col p-[1%] md:min-h-[auto]">
            {/* 타이틀 및 내용 */}
            <div className={TEXT_CONTENT_CLASS}>
              <h2
                id={titleId}
                className="shrink-0 text-[clamp(26px,2.1vw,34px)] font-bold text-brand md:shrink"
              >
                {isEnglish ? data.titleEn : data.titleKo}
              </h2>
              <div className="mb-[1.6%] mt-[0.8%] h-[2px] w-[10%] shrink-0 bg-brand md:shrink" />
              <p className="shrink-0 text-center text-[clamp(14px,1.1vw,18px)] md:shrink">
                {isEnglish ? data.descriptionEn : data.descriptionKo}
              </p>
            </div>

            {/* '일주일간 보지 않기' 체크박스 */}
            <HideForWeekCheckbox
              id="update-modal-hide-for-week-predefined"
              isChecked={isChecked}
              onChecked={onChecked}
              className="shrink-0 px-[2%] py-[1.6%] md:shrink"
            />
          </div>
        </>
      ) : (
        <div className={IMAGE_ONLY_CONTENT_CLASS}>
          {/* 이미지 컨텐츠 */}
          <div className={IMAGE_ONLY_IMAGE_CONTAINER_CLASS}>
            <img
              src={patchNoteImage}
              alt={t('업데이트 이미지')}
              className="block h-full w-full object-contain md:h-auto md:object-fill"
            />
          </div>

          {/* '일주일간 보지 않기' 체크박스 */}
          <HideForWeekCheckbox
            id="update-modal-hide-for-week-image-only"
            isChecked={isChecked}
            onChecked={onChecked}
            className="shrink-0 px-[3%] py-[1.6%]"
          />
        </div>
      )}

      {/* 버튼 영역 */}
      <button
        type="button"
        className={clsx(
          CLOSE_BUTTON_CLASS,
          isPredefined ? 'h-[8.8%]' : 'h-[clamp(52px,min(4.18vw,7.04vh),68px)]',
        )}
        onClick={onClose}
        aria-label={t('닫기')}
      >
        <p className="text-[clamp(16px,1.375vw,22px)] font-semibold">
          {t('닫기')}
        </p>
      </button>
    </div>
  );
}
