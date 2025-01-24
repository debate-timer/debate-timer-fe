interface DeleteConfirmContentProps {
  onDelete: () => void;
  onClose: () => void; // 모달 닫기 함수
}

export default function DeleteConfirmContent({
  onDelete,
  onClose,
}: DeleteConfirmContentProps) {
  const handleDelete = () => {
    onDelete();
    onClose();
  };
  return (
    <div className="px-12 py-8">
      <h2 className={`mb-4 text-xl font-bold`}>
        타임 박스를 삭제하시겠습니까?
      </h2>
      <div className="flex flex-col space-y-6">
        <button
          className="mt-4 w-full rounded bg-amber-300 p-2 hover:bg-amber-500"
          onClick={handleDelete}
        >
          삭제하기
        </button>
      </div>
    </div>
  );
}
