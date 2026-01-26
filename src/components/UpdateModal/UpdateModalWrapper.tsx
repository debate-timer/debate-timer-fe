import { useEffect, useState } from 'react';
import { useModal } from '../../hooks/useModal';
import UpdateModal from './UpdateModal';
import { LATEST_PATCH_NOTE } from '../../constants/patch_note';

const DISMISS_DATE_KEY = 'dismissDate';

// 로컬 스토리지에서 날짜를 안전하게 가져오는 헬퍼 함수
// 유효한 날짜면 Date 객체를, 없거나 유효하지 않으면 null 반환
const getSafeDateFromStorage = (): Date | null => {
  const rawDate = localStorage.getItem(DISMISS_DATE_KEY);
  if (!rawDate) return null;

  const date = new Date(rawDate);
  // date.getTime()이 NaN이면 유효하지 않은 날짜임
  return isNaN(date.getTime()) ? null : date;
};

export default function UpdateModalWrapper() {
  // 상태 관리, 환경 변수 및 기타 변수 선언
  const [isChecked, setIsChecked] = useState(false);
  const newContentUrl = import.meta.env.VITE_UPDATE_CONTENT_URL;

  // 모달 훅 사용
  const { openModal, closeModal, ModalWrapper } = useModal({
    onClose: () => {
      // 모달 닫을 때 '일주일 간 보지 않기'가 체크되어 있으면, 현재 시간을 로컬 저장소에 기록
      if (isChecked) {
        localStorage.setItem(DISMISS_DATE_KEY, new Date().toISOString());
      }
    },
  });

  // '자세히 보기' 버튼 클릭 시 동작
  const handleClickDetailButton = () => {
    // 모달 닫고 Notion 업데이트 소개 페이지로 이동
    closeModal();
    window.open(newContentUrl, '_blank', 'noopener,noreferrer');
  };

  // 모달이 열리는 조건 확인
  useEffect(() => {
    // 로컬 저장소에 저장된 날짜가 있다면, 검증을 거쳐 안전히 불러오기
    const lastDismissedDate = getSafeDateFromStorage();

    // 일(day) 차이 계산
    if (lastDismissedDate) {
      const now = new Date();
      const timeDiff = now.getTime() - lastDismissedDate.getTime();
      const daysDiff = timeDiff / (1000 * 60 * 60 * 24);

      if (daysDiff < 7) {
        console.log('모달 열지 않기');
        return;
      }
    }

    // 차이가 7일 초과할 시 모달 열기
    openModal();
    console.log('모달 열기');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 페이지 열릴 때 최초 1회만 실행되도록 의존성 배열을 비웠음

  return (
    <>
      <ModalWrapper>
        <UpdateModal
          data={LATEST_PATCH_NOTE}
          isChecked={isChecked}
          onChecked={setIsChecked}
          onClickDetailButton={() => handleClickDetailButton()}
        />
      </ModalWrapper>
    </>
  );
}
