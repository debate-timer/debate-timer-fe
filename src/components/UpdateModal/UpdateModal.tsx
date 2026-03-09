import MegaphoneAsset from './MegaphoneAsset';
import NoticeAsset from './NoticeAsset';
import {
  ImageOnlyPatchNoteData,
  isPredefinedPatchNote,
  PatchNoteData,
} from '../../constants/patch_note';

interface UpdateModalProps {
  data: PatchNoteData;
  isChecked: boolean;
  onChecked: (value: boolean) => void;
  onClickDetailButton: () => void;
}

export default function UpdateModal({
  data,
  isChecked,
  onChecked,
  onClickDetailButton,
}: UpdateModalProps) {
  return (
    <div className="flex aspect-square w-[clamp(600px,min(47.5vw,90vh),780px)] flex-col overflow-hidden rounded-[2.2%] bg-default-white">
      {isPredefinedPatchNote(data) ? (
        <>
          {/* 메인 컨텐츠 */}
          <div className="flex h-[59.5%] w-full flex-col gap-[clamp(36px,2.75vw,44px)] bg-[#EFF0F4] p-[4.5%]">
            <div className="flex h-[clamp(72px,6vh,96px)] w-full flex-row items-center gap-[1%]">
              <div className="h-full w-[15.7%] shrink-0">
                <MegaphoneAsset className="my-[8px] h-[80px] w-[93px]" />
              </div>

              <div className="flex w-full flex-col space-y-[clamp(15px,1.25vw,20px)]">
                <p className="text-[clamp(12px,0.875vw,14px)] leading-none text-default-black">
                  디베이트 타이머에 새로운 기능이 생겼어요!
                </p>

                <div className="w-[37.3%] shrink-0">
                  <NoticeAsset className="h-auto w-full" />
                </div>
              </div>
            </div>

            <div className="flex w-full flex-1 overflow-hidden">
              {data.image && (
                <img
                  src={data.image}
                  alt="업데이트 이미지"
                  className="h-full w-full rounded-[0.8%] object-contain"
                />
              )}
            </div>
          </div>

          {/* 텍스트 컨텐츠 */}
          <div className="flex w-full flex-1 flex-col p-[1%]">
            {/* 타이틀 및 내용 */}
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-[clamp(26px,2.1vw,34px)] font-bold text-brand">
                {data.title}
              </p>
              <div className="mb-[1.6%] mt-[0.8%] h-[2px] w-[10%] bg-brand" />
              <p className="text-center text-[clamp(14px,1.1vw,18px)]">
                {data.description}
              </p>
            </div>

            {/* '일주일 간 보지 않기' 체크박스 */}
            <label
              htmlFor="update-modal-hide-for-week-predefined"
              className="flex w-full flex-row items-center justify-start gap-[0.8%]"
            >
              <input
                id="update-modal-hide-for-week-predefined"
                type="checkbox"
                className="border-gray size-[clamp(12px,0.93vw,15px)] rounded-[4px]"
                checked={isChecked}
                onChange={(e) => onChecked(e.target.checked)}
              />
              <p className="text-[clamp(10px,0.75vw,12px)]">
                일주일 간 보지 않기
              </p>
            </label>
          </div>
        </>
      ) : (
        <div className="relative flex h-full w-full flex-1">
          {/* 이미지 컨텐츠 */}
          {(data as ImageOnlyPatchNoteData).image && (
            <img
              src={data.image}
              alt="업데이트 이미지"
              className="h-full w-full rounded-t-[0.8%] object-contain"
            />
          )}

          {/* '일주일 간 보지 않기' 체크박스 */}
          <label
            htmlFor="update-modal-hide-for-week-image-only"
            className="absolute bottom-[1%] start-[1%] flex w-full flex-row items-center gap-[0.8%]"
          >
            <input
              id="update-modal-hide-for-week-image-only"
              type="checkbox"
              className="border-gray size-[clamp(16px,1.25vw,20px)] rounded-[4px]"
              checked={isChecked}
              onChange={(e) => onChecked(e.target.checked)}
            />
            <p className="text-[clamp(10px,0.75vw,12px)]">
              일주일 간 보지 않기
            </p>
          </label>
        </div>
      )}

      {/* 버튼 영역 */}
      <button
        className="flex h-[8.8%] flex-row items-center justify-center bg-brand transition-all hover:bg-brand-hover"
        onClick={onClickDetailButton}
      >
        <p className="text-[clamp(16px,1.375vw,22px)] font-semibold">
          자세히 보기
        </p>
      </button>
    </div>
  );
}
