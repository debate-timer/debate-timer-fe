import { useTranslation } from 'react-i18next';
import MegaphoneAsset from './MegaphoneAsset';
import NoticeAsset from './NoticeAsset';
import {
  isPredefinedPatchNote,
  PatchNoteData,
} from '../../constants/patch_note';
import { DEFAULT_LANG, isSupportedLang } from '../../util/languageRouting';
import DTCheck from '../icons/Check';
import clsx from 'clsx';

// predefined 모드는 정사각형 비율 안에서 퍼센트 단위로 배치함
const PREDEFINED_MODAL_CLASS =
  'aspect-square w-[clamp(600px,min(47.5vw,90vh),780px)]';
// image-only 모드는 이미지 비율대로 높이가 정해지므로 화면 높이를 넘지 않도록 너비를 제한함
const IMAGE_ONLY_MODAL_CLASS = 'w-[clamp(600px,min(47.5vw,80vh),780px)]';

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

export default function UpdateModal(props: UpdateModalProps) {
  const { data, isChecked, onChecked, onClose } = props;
  const { t, i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const primaryLang = currentLang?.split(/[-_]/)[0];
  const lang = isSupportedLang(primaryLang) ? primaryLang : DEFAULT_LANG;
  const isEnglish = lang === 'en';
  const patchNoteImage = isEnglish ? data.imageEn : data.imageKo;
  const isPredefined = isPredefinedPatchNote(data);

  return (
    <div
      className={clsx(
        'flex flex-col overflow-hidden rounded-[2.2%] bg-default-white',
        isPredefined ? PREDEFINED_MODAL_CLASS : IMAGE_ONLY_MODAL_CLASS,
      )}
    >
      {isPredefined ? (
        <>
          {/* 메인 컨텐츠 */}
          <div className="flex h-[59.5%] w-full flex-col gap-[clamp(36px,2.75vw,44px)] bg-[#EFF0F4] p-[4.5%]">
            <div className="flex h-[clamp(72px,6vh,96px)] w-full flex-row items-center gap-[1%]">
              <div className="h-full w-[15.7%] shrink-0">
                <MegaphoneAsset className="my-[8px] h-[80px] w-[93px]" />
              </div>

              <div className="flex w-full flex-col space-y-[clamp(15px,1.25vw,20px)]">
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
          <div className="flex w-full flex-1 flex-col p-[1%]">
            {/* 타이틀 및 내용 */}
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-[clamp(26px,2.1vw,34px)] font-bold text-brand">
                {isEnglish ? data.titleEn : data.titleKo}
              </p>
              <div className="mb-[1.6%] mt-[0.8%] h-[2px] w-[10%] bg-brand" />
              <p className="text-center text-[clamp(14px,1.1vw,18px)]">
                {isEnglish ? data.descriptionEn : data.descriptionKo}
              </p>
            </div>

            {/* '일주일간 보지 않기' 체크박스 */}
            <HideForWeekCheckbox
              id="update-modal-hide-for-week-predefined"
              isChecked={isChecked}
              onChecked={onChecked}
              className="px-[2%] py-[1.6%]"
            />
          </div>
        </>
      ) : (
        <div className="flex w-full flex-col">
          {/* 이미지 컨텐츠 */}
          <div className="w-full">
            <img
              src={patchNoteImage}
              alt={t('업데이트 이미지')}
              className="block h-auto w-full"
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
          'flex shrink-0 flex-row items-center justify-center bg-brand transition-all hover:bg-brand-hover',
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
