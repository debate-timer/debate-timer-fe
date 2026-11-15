import { ReactNode, useCallback, useRef, useState } from 'react';
import useThrottle from './useThrottle';

interface UseDragAndDropProps<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  throttleDelay?: number;
}

export function useDragAndDrop<T>({
  data,
  setData,
  throttleDelay = 50,
}: UseDragAndDropProps<T>) {
  const dragIndexRef = useRef<number | null>(null); // 드래그 중인 항목의 인덱스
  const hoverIndexRef = useRef<number | null>(null); // 호버 중인 인덱스 ref
  const itemHeightRef = useRef<number>(0); // 아이템의 평균 높이
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // 호버 중인 인덱스

  const handlePointerDown = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handlePointerMove = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      containerHeight: number,
      itemCount: number,
    ) => {
      if (dragIndexRef.current === null || itemCount <= 0) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const avgHeight = containerHeight / itemCount;
      itemHeightRef.current = avgHeight;

      const hoverPos = Math.floor((e.clientY - rect.top) / avgHeight);
      const nextHoverIndex =
        hoverPos < 0 ? 0 : hoverPos >= itemCount ? itemCount - 1 : hoverPos;
      hoverIndexRef.current = nextHoverIndex;
      setHoverIndex(nextHoverIndex);
    },
    [],
  );

  const throttledHandlePointerMove = useThrottle(
    handlePointerMove,
    throttleDelay,
  );

  const handlePointerUp = useCallback(() => {
    const dragIndex = dragIndexRef.current;
    const currentHoverIndex = hoverIndexRef.current;
    if (
      dragIndex !== null &&
      currentHoverIndex !== null &&
      dragIndex !== currentHoverIndex
    ) {
      setData((prevData) => {
        const updatedData = [...prevData];
        const [movedItem] = updatedData.splice(dragIndex, 1);
        updatedData.splice(currentHoverIndex, 0, movedItem);
        return updatedData;
      });
    }
    dragIndexRef.current = null;
    hoverIndexRef.current = null;
    setHoverIndex(null);
  }, [setData]);

  const handlePointerCancel = useCallback(() => {
    dragIndexRef.current = null;
    hoverIndexRef.current = null;
    setHoverIndex(null);
  }, []);

  const getDraggingStyles = (index: number) => {
    const dragIndex = dragIndexRef.current;
    const itemHeight = itemHeightRef.current;

    if (index === dragIndex) {
      const distance =
        (hoverIndex !== null ? hoverIndex - index : 0) * itemHeight;
      return {
        transform: `translateY(${distance}px)`,
        opacity: 0.8,
      };
    }

    if (hoverIndex !== null && dragIndex !== null) {
      if (index > dragIndex && index <= hoverIndex) {
        return {
          transform: `translateY(-${itemHeight}px)`,
        };
      }
      if (index < dragIndex && index >= hoverIndex) {
        return {
          transform: `translateY(${itemHeight}px)`,
        };
      }
    }
  };

  const DragAndDropWrapper = useCallback(
    ({ children }: { children: ReactNode }) => {
      return (
        <div
          className="flex w-full flex-col gap-2"
          onPointerMove={(e) =>
            throttledHandlePointerMove(
              e,
              e.currentTarget.getBoundingClientRect().height,
              data.length,
            )
          }
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          {children}
        </div>
      );
    },
    [
      data.length,
      handlePointerCancel,
      handlePointerUp,
      throttledHandlePointerMove,
    ],
  );

  return {
    data,
    handlePointerDown,
    DragAndDropWrapper,
    getDraggingStyles,
  };
}
