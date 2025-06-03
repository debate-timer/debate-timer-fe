import { isGuestFlow } from '../../util/sessionStorage';

interface HeaderTitleProps {
  title?: string;
  isGuestMode?: boolean;
}

export default function HeaderTitle({ title, isGuestMode }: HeaderTitleProps) {
  const displayTitle = !title?.trim() ? '주제 없음' : title.trim();
  if (isGuestMode === undefined) {
    isGuestMode = isGuestFlow();
  }

  return isGuestMode ? (
    <div className="flex w-full max-w-[50vw] flex-row items-center justify-center space-x-2">
      <h1 className="overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
        {displayTitle}
      </h1>
      <p className="flex items-center text-neutral-500">(비회원으로 사용 중)</p>
    </div>
  ) : (
    <h1 className="w-full max-w-[50vw] overflow-hidden text-ellipsis whitespace-nowrap text-3xl font-bold">
      {displayTitle}
    </h1>
  );
}
