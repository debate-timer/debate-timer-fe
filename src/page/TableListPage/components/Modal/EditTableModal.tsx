import EditTableButton from './EditTableButton';

export default function EditTableModal({
  name,
  type,
  closeModal,
}: {
  name: string;
  type: string;
  closeModal: () => void;
}) {
  return (
    <div className="flex h-[700px] w-full flex-col">
      <div className="flex h-[100px] items-center justify-center bg-neutral-300 text-3xl font-semibold lg:text-5xl">
        <h1>{name} 수정</h1>
      </div>
      <section className="flex flex-1 flex-col justify-center gap-14 p-8 lg:items-center">
        <div className="flex w-full items-center justify-between">
          <h1 className="text-md font-bold lg:text-5xl">토론 시간표 이름</h1>
          <input
            placeholder="시간표 1"
            className="w-8/12 rounded-md bg-neutral-300 p-6 text-center font-semibold text-white placeholder-white lg:text-3xl"
          />
        </div>
        <div className="flex w-full items-center justify-between">
          <h1 className="text-md font-bold lg:text-5xl">토론 유형</h1>
          <div className="w-8/12 bg-neutral-300 p-6 text-center text-3xl font-semibold text-white hover:cursor-not-allowed">
            {type}
          </div>
        </div>
      </section>
      <EditTableButton closeModal={closeModal} />
    </div>
  );
}
