import { useEffect } from 'react';
import ToggleForDebateType from './ToggleForDebateType';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ModalToMakeTable({ isOpen, onClose }: ModalProps) {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative flex h-[800px] w-[1200px] flex-col bg-white">
        <div className="flex h-[100px] items-center justify-center bg-neutral-300 text-5xl font-semibold">
          <h1>어떤 토론을 원하시나요?</h1>
          <button
            onClick={onClose}
            className="absolute right-2 top-2 text-4xl font-semibold hover:scale-110"
          >
            X
          </button>
        </div>
        <section className="flex flex-1 flex-col justify-center gap-14 p-6">
          <div className="flex items-center justify-center gap-4">
            <h1 className="w-[400px] text-5xl font-bold">토론 시간표 이름</h1>
            <input
              placeholder="시간표#1(디폴트 값)"
              className="w-[600px] rounded-md bg-neutral-300 p-6 text-center text-3xl font-semibold text-white placeholder-white"
            />
          </div>
          <div className="flex items-center justify-center gap-4">
            <h1 className="w-[400px] text-5xl font-bold">토론 유형</h1>
            <ToggleForDebateType />
          </div>
        </section>
        <button className="h-[80px] w-full bg-red-200 text-4xl font-semibold transition duration-300 hover:bg-red-300">
          테이블 만들기
        </button>
      </div>
    </div>
  );
}
