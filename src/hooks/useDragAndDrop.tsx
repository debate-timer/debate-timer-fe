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
  const activePointerIdRef = useRef<number | null>(null); // 활성 드래그 포인터 ID
  const hoverIndexRef = useRef<number | null>(null); // 호버 중인 인덱스 ref
  const lastMoveRef = useRef<{
    clientY: number;
    rectTop: number;
    containerHeight: number;
    itemCount: number;
  } | null>(null);
  const itemHeightRef = useRef<number>(0); // 아이템의 평균 높이
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // 호버 중인 인덱스

  const handlePointerDown = useCallback((index: number, pointerId?: number) => {
    dragIndexRef.current = index;
    activePointerIdRef.current = pointerId ?? null;
    lastMoveRef.current = null;
  }, []);

  const computeHoverIndex = useCallback(
    (
      clientY: number,
      rectTop: number,
      containerHeight: number,
      itemCount: number,
    ) => {
      if (itemCount <= 0 || containerHeight <= 0) {
        return null;
      }
      const avgHeight = containerHeight / itemCount;
      itemHeightRef.current = avgHeight;
      const hoverPos = Math.floor((clientY - rectTop) / avgHeight);
      return Math.min(itemCount - 1, Math.max(0, hoverPos));
    },
    [],
  );

  const handlePointerMove = useCallback(
    (
      e: React.PointerEvent<HTMLDivElement>,
      containerHeight: number,
      itemCount: number,
    ) => {
      if (dragIndexRef.current === null || itemCount <= 0) {
        return;
      }
      if (
        activePointerIdRef.current !== null &&
        e.pointerId !== activePointerIdRef.current
      ) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const nextHoverIndex = computeHoverIndex(
        e.clientY,
        rect.top,
        containerHeight,
        itemCount,
      );
      if (nextHoverIndex === null) {
        return;
      }
      hoverIndexRef.current = nextHoverIndex;
      setHoverIndex(nextHoverIndex);
    },
    [computeHoverIndex],
  );

  const throttledHandlePointerMove = useThrottle(
    handlePointerMove,
    throttleDelay,
  );

  const handlePointerUp = useCallback(
    (e?: React.PointerEvent<HTMLDivElement>) => {
      if (
        e &&
        activePointerIdRef.current !== null &&
        e.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      const dragIndex = dragIndexRef.current;
      let currentHoverIndex = hoverIndexRef.current;
      if (lastMoveRef.current) {
        const latestHover = computeHoverIndex(
          lastMoveRef.current.clientY,
          lastMoveRef.current.rectTop,
          lastMoveRef.current.containerHeight,
          lastMoveRef.current.itemCount,
        );
        if (latestHover !== null) {
          currentHoverIndex = latestHover;
        }
      }
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
      activePointerIdRef.current = null;
      lastMoveRef.current = null;
      hoverIndexRef.current = null;
      setHoverIndex(null);
    },
    [computeHoverIndex, setData],
  );

  const handlePointerCancel = useCallback(
    (e?: React.PointerEvent<HTMLDivElement>) => {
      if (
        e &&
        activePointerIdRef.current !== null &&
        e.pointerId !== activePointerIdRef.current
      ) {
        return;
      }
      dragIndexRef.current = null;
      activePointerIdRef.current = null;
      lastMoveRef.current = null;
      hoverIndexRef.current = null;
      setHoverIndex(null);
    },
    [],
  );

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
          onPointerMove={(e) => {
            if (
              dragIndexRef.current !== null &&
              (activePointerIdRef.current === null ||
                e.pointerId === activePointerIdRef.current)
            ) {
              const rect = e.currentTarget.getBoundingClientRect();
              lastMoveRef.current = {
                clientY: e.clientY,
                rectTop: rect.top,
                containerHeight: rect.height,
                itemCount: data.length,
              };
            }
            throttledHandlePointerMove(
              e,
              e.currentTarget.getBoundingClientRect().height,
              data.length,
            );
          }}
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
