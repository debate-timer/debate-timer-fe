import { useEffect } from 'react';

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
      <div className="relative flex h-[600px] w-[1200px] flex-col rounded-md bg-white">
        <div className="flex h-[100px] items-center justify-center bg-neutral-300 text-5xl font-semibold">
          <h1>어떤 토론을 원하시나요?</h1>
          <button
            onClick={onClose}
            className="absolute right-1 top-1 text-xl font-bold"
          >
            X
          </button>
        </div>
        <section className="flex-1 border-2 border-blue-100">
          <div className="p-6">
            <div>111</div>
            <div>222</div>
          </div>
        </section>
        <button className="h-[80px] w-full bg-red-200 text-4xl font-semibold transition duration-300 hover:bg-red-300">
          테이블 만들기
        </button>
      </div>
    </div>
  );
}
