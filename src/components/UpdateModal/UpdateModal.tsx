import MegaphoneAsset from './MegaphoneAsset';
import NoticeAsset from './NoticeAsset';
import {
  ImageOnlyPatchNoteData,
  isPredefinedPatchNote,
  PatchNoteData,
  PredefinedPatchNoteData,
} from '../../constants/patch_note';

interface UpdateModalProps {
  data: PatchNoteData;
  isChecked: boolean;
  onChecked: (value: boolean) => void;
}

export default function UpdateModal({
  data,
  isChecked,
  onChecked,
}: UpdateModalProps) {
  // '자세히 보기' 버튼 클릭 시 동작
  const handleDetailButtonClick = () => {
    if (data.link) {
      window.open(data.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex size-[1000px] flex-col rounded-[22px] bg-default-white">
      {isPredefinedPatchNote(data) ? (
        <>
          {/* 메인 컨텐츠 */}
          <div className="flex h-[600px] w-full flex-col space-y-[20px] bg-[#EFF0F4] p-[45px]">
            <div className="flex w-full flex-row items-center space-x-[10px]">
              <MegaphoneAsset className="w-[107px]" />
              <div className="flex flex-col space-y-[18px]">
                <p className="font-[20px] leading-none text-default-black">
                  디베이트 타이머에 새로운 기능이 생겼어요!
                </p>
                <NoticeAsset />
              </div>
            </div>

            <div className="flex w-full flex-1">
              {data.image && (
                <img
                  src={data.image}
                  alt="업데이트 이미지"
                  className="h-full w-full rounded-lg object-contain"
                />
              )}
            </div>
          </div>

          {/* 텍스트 컨텐츠 */}
          <div className="flex w-full flex-1 flex-col p-[8px]">
            {/* 타이틀 및 내용 */}
            <div className="flex h-full flex-col items-center justify-center">
              <p className="text-[45px] font-bold text-brand">
                {(data as PredefinedPatchNoteData).title}
              </p>
              <div className="mb-[16px] mt-[8px] h-[2px] w-[100px] bg-brand" />
              <p className="text-center text-[24px]">
                {(data as PredefinedPatchNoteData).description}
              </p>
            </div>

            {/* '일주일 간 보지 않기' 체크박스 */}
            <div className="flex w-full flex-row items-center space-x-[8px]">
              <input
                id="update-modal-hide-for-week"
                type="checkbox"
                className="border-gray size-[24px] rounded-[4px]"
                checked={isChecked}
                onChange={(e) => onChecked(e.target.checked)}
              />
              <p>일주일 간 보지 않기</p>
            </div>
          </div>
        </>
      ) : (
        <div className="relative flex h-full w-full flex-1">
          {/* 이미지 컨텐츠 */}
          {(data as ImageOnlyPatchNoteData).image && (
            <img
              src={data.image}
              alt="업데이트 이미지"
              className="h-full w-full rounded-t-lg object-contain"
            />
          )}

          {/* '일주일 간 보지 않기' 체크박스 */}
          <div className="absolute bottom-[8px] start-[8px] flex w-full flex-row items-center space-x-[8px]">
            <input
              id="update-modal-hide-for-week"
              type="checkbox"
              className="border-gray size-[24px] rounded-[4px]"
              checked={isChecked}
              onChange={(e) => onChecked(e.target.checked)}
            />
            <p>일주일 간 보지 않기</p>
          </div>
        </div>
      )}

      {/* 버튼 영역 */}
      <button
        className="flex h-[88px] flex-row items-center justify-center bg-brand transition-all hover:bg-brand-hover"
        onClick={handleDetailButtonClick}
      >
        <p className="text-[22px] font-semibold">자세히 보기</p>
      </button>
    </div>
  );
}
