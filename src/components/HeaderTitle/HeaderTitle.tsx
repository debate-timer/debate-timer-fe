import Skeleton from '../Skeleton/Skeleton';

interface HeaderTitleProps {
  title?: string;
  skeletonEnabled?: boolean;
}

export default function HeaderTitle(props: HeaderTitleProps) {
  const { title, skeletonEnabled: isLoading = false } = props;

  return (
    <>
      {isLoading && (
        <div className="flex items-center justify-center">
          <Skeleton width={400} height={32} />
        </div>
      )}
      {!isLoading && (
        <h1 className="w-full max-w-[50vw] overflow-hidden text-ellipsis whitespace-nowrap text-3xl">
          {title}
        </h1>
      )}
    </>
  );
}
