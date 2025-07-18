interface SkeletonProps {
  height?: number;
  width?: number;
}

/**
 * 스켈레톤 UI를 나타내는 가장 기본적인 컴포넌트 단위
 * @param props.width 너비, 단위는 px이며 기본값 120 px
 * @param props.height 높이, 단위는 px이며 기본값 24 px
 */
export default function Skeleton(props: SkeletonProps) {
  const { height = 24, width = 120 } = props;

  return (
    <div
      className={`animate-pulse rounded-2xl bg-neutral-600`}
      style={{ height: `${height}px`, width: `${width}px` }}
    ></div>
  );
}
