/**
 * Props for LoggedInStoreDBModal
 */
interface LoggedInStoreDBModalProps {
  onSave: () => void;
  onContinue: () => void;
}

/**
 * ### Component LoggedInStoreDBModal
 * 로그인 상태의 유저기 비회원 플로우에 접근할 때, 데이터를 DB에 저장할지 물어보는 모달
 *
 * @param props.onSave 로그인 사용자가 DB에 저장 시 실행되는 함수
 * @param props.onContinue 로그인 사용자가 DB에 저장하지 않고 비회원 플로우를 탈 시 실행되는 함수
 * @returns JSX.Element
 */
export default function LoggedInStoreDBModal({
  onSave,
  onContinue,
}: LoggedInStoreDBModalProps) {
  return (
    <div className="flex w-[500px] flex-col items-center justify-center space-y-10 p-[40px]">
      <div className="relative flex flex-col items-center justify-center space-y-6 rounded-2xl p-10">
        <p className="break-keep text-center text-[20px] text-neutral-800">
          공유된 토론 테이블을 내 테이블 목록에 저장하시겠어요?
        </p>
      </div>

      <div className="flex w-full flex-col space-y-4">
        <button className="small-button enabled py-2" onClick={onSave}>
          네, 내 테이블 목록에 저장할게요.
        </button>
        <button className="small-button enabled py-2" onClick={onContinue}>
          아니요, 저장하지 않고 진행할게요.
        </button>
      </div>
    </div>
  );
}
