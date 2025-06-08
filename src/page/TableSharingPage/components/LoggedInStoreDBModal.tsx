import DialogModal from '../../../components/DialogModal/DialogModal';

/**
 * Props for LoggedInStoreDBModal
 */
interface LoggedInStoreDBModalProps {
  onSave: () => void;
  onContinue: () => void;
}

/**
 * ### Component LoggedInStoreDBModal
 * 로그인 상태의 유저가 비회원 플로우에 접근할 때, 데이터를 DB에 저장할지 물어보는 모달
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
    <DialogModal
      left={{ text: '비회원 상태로 토론하기', onClick: () => onContinue() }}
      right={{
        text: '저장하기',
        onClick: () => onSave(),
        isBold: true,
      }}
    >
      <h1 className="break-keep px-20 py-10 text-center text-xl font-bold">
        공유받은 토론 시간표를 내 시간표 목록에 저장하시겠어요?
      </h1>
    </DialogModal>
  );
}
