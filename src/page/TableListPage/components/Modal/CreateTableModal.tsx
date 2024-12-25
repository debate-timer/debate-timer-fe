import ToggleForDebateType from './ToggleForDebateType';
import CreateTableButton from './CreateTableButton';
import { useModal } from '../../../../hooks/useModal';

export default function CreateTableModal() {
  const { openModal, closeModal, ModalWrapper } = useModal({
    closeOnOverlayClick: true, // 오버레이 클릭 시 모달 닫기
  });

  return (
    <>
      <button
        onClick={openModal}
        className="rounded bg-blue-500 px-4 py-2 text-white"
      >
        모달 열기
      </button>

      <ModalWrapper>
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative flex h-[800px] w-[1200px] flex-col bg-white">
            <div className="flex h-[100px] items-center justify-center bg-neutral-300 text-5xl font-semibold">
              <h1>어떤 토론을 원하시나요?</h1>
              <button
                onClick={closeModal}
                className="absolute right-4 top-7 text-5xl font-semibold hover:scale-110"
              >
                X
              </button>
            </div>
            <section className="flex flex-1 flex-col justify-center gap-14 p-6">
              <div className="flex items-center justify-center gap-4">
                <h1 className="w-[400px] text-5xl font-bold">
                  토론 시간표 이름
                </h1>
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
            <CreateTableButton />
          </div>
        </div>
      </ModalWrapper>
    </>
  );
}
