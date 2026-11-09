import Skeleton from '../Skeleton/Skeleton';

const HEADER_TITLE_CLASS_NAME =
  'w-full max-w-[50vw] overflow-hidden text-xl leading-tight text-ellipsis whitespace-nowrap md:text-3xl md:leading-[36px] short:text-xl short:leading-[28px]';

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
      {!isLoading && <h1 className={HEADER_TITLE_CLASS_NAME}>{title}</h1>}
    </>
  );
}
