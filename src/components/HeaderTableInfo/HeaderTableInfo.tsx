import Skeleton from '../Skeleton/Skeleton';

interface HeaderTitleProps {
  name?: string;
  skeletonEnabled?: boolean;
}

export default function HeaderTableInfo(props: HeaderTitleProps) {
  const { name, skeletonEnabled: isLoading = false } = props;
  const displayName = !name?.trim() ? '테이블 이름 없음' : name.trim();

  return (
    <>
      {isLoading && (
        <div className="flex flex-col space-y-[4px]">
          <Skeleton width={80} height={16} />
          <Skeleton width={240} height={24} />
        </div>
      )}
      {!isLoading && (
        <div className="flex flex-col space-y-[4px]">
          <h1 className="text-sm">테이블 이름</h1>
          <h1 className="text-2xl font-bold">{displayName}</h1>
        </div>
      )}
    </>
  );
}
