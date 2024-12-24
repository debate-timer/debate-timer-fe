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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="relative w-[300px] rounded-md bg-white p-6">
        <button
          onClick={onClose}
          className="absolute right-2 top-2 text-xl font-bold"
        >
          X
        </button>
        <div>테스트@@</div>
      </div>
    </div>
  );
}
