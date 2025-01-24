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
  const itemHeightRef = useRef<number>(0); // 아이템의 평균 높이
  const [hoverIndex, setHoverIndex] = useState<number | null>(null); // 호버 중인 인덱스

  const handleMouseDown = useCallback((index: number) => {
    dragIndexRef.current = index;
  }, []);

  const handleMouseMove = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement>,
      containerHeight: number,
      itemCount: number,
    ) => {
      if (dragIndexRef.current === null || itemCount <= 0) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const avgHeight = containerHeight / itemCount;
      itemHeightRef.current = avgHeight;

      const hoverPos = Math.floor((e.clientY - rect.top) / avgHeight);
      setHoverIndex(
        hoverPos < 0 ? 0 : hoverPos >= itemCount ? itemCount - 1 : hoverPos,
      );
    },
    [],
  );

  const throttledHandleMouseMove = useThrottle(handleMouseMove, throttleDelay);

  const handleMouseUp = useCallback(() => {
    const dragIndex = dragIndexRef.current;
    if (dragIndex !== null && hoverIndex !== null && dragIndex !== hoverIndex) {
      setData((prevData) => {
        const updatedData = [...prevData];
        const [movedItem] = updatedData.splice(dragIndex, 1);
        updatedData.splice(hoverIndex, 0, movedItem);
        return updatedData;
      });
    }
    dragIndexRef.current = null;
    setHoverIndex(null);
  }, [hoverIndex, setData]);

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

    return {
      transform: 'translateY(0)',
    };
  };

  const DragAndDropWrapper = ({ children }: { children: ReactNode }) => {
    return (
      <div
        className="flex w-full flex-col gap-2"
        onMouseMove={(e) =>
          throttledHandleMouseMove(
            e,
            e.currentTarget.getBoundingClientRect().height,
            data.length,
          )
        }
        onMouseUp={handleMouseUp}
      >
        {children}
      </div>
    );
  };

  return {
    data,
    handleMouseDown,
    DragAndDropWrapper,
    getDraggingStyles,
  };
}
