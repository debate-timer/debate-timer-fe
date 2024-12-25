import ToggleForDebateType from './ToggleForDebateType';
import CreateTableButton from './CreateTableButton';

interface ModalProps {
  closeModal: () => void;
  ModalWrapper: ({
    children,
  }: {
    children: React.ReactNode;
  }) => JSX.Element | null;
}

export default function CreateTableModal({ ModalWrapper }: ModalProps) {
  return (
    <ModalWrapper>
      <div className="flex h-[700px] w-full flex-col">
        <div className="flex h-[100px] items-center justify-center bg-neutral-300 text-5xl font-semibold">
          <h1>어떤 토론을 원하시나요?</h1>
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
        <CreateTableButton />
      </div>
    </ModalWrapper>
  );
}
