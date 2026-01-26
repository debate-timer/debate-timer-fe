import { useEffect, useState } from 'react';
import { useModal } from '../../hooks/useModal';
import UpdateModal from './UpdateModal';
import { LATEST_PATCH_NOTE } from '../../constants/patch_note';

const STORAGE_KEY = 'update_notification_status';

// 로컬 스토리지에 저장될 패치 노트의 데이터 타입 정의
interface StoredStatus {
  version: string; // 패치 노트 버전
  dismissedAt: string; // 일주일 간 무시하기 체크 시 기록되는 시간
}

export default function UpdateModalWrapper() {
  // 상태 관리, 환경 변수 및 기타 변수 선언
  const [isChecked, setIsChecked] = useState(false);

  // 모달 훅 사용
  const { openModal, ModalWrapper } = useModal({
    onClose: () => {
      // 모달 닫을 때 '일주일 간 보지 않기'가 체크되어 있으면, 현재 시간과 패치 노트 버전을 로컬 저장소에 기록
      if (isChecked) {
        const status: StoredStatus = {
          version: LATEST_PATCH_NOTE.version,
          dismissedAt: new Date().toISOString(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
      }
    },
  });

  // 모달이 열리는 조건 확인
  useEffect(() => {
    // 로컬 저장소에 저장된 날짜가 있다면, 검증을 거쳐 안전히 불러오기
    const rawData = localStorage.getItem(STORAGE_KEY);

    // 데이터가 없는 경우(= 처음 접속한 경우), 모달 표시
    if (!rawData) {
      openModal();
      return;
    }

    try {
      // 값 불러오기
      const status: StoredStatus = JSON.parse(rawData);
      const dismissDate = new Date(status.dismissedAt);

      // 값 검증 실패 시, 모달 표시
      if (!status.version || isNaN(dismissDate.getTime())) {
        openModal();
        return;
      }

      // 패치 노트 버전이 다를 시, 모달 표시
      if (status.version !== LATEST_PATCH_NOTE.version) {
        openModal();
        return;
      }

      // 버전이 동일하다면, 7일이 지났는지 확인
      const now = new Date();
      const timeDiff = now.getTime() - dismissDate.getTime();
      const daysDiff = Math.floor(timeDiff / (1000 * 3600 * 24));

      if (daysDiff >= 7) {
        openModal();
        return;
      }
    } catch {
      // 기타 오류나 예외 발생 시, 모달 표시
      openModal();
      return;
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 페이지 열릴 때 최초 1회만 실행되도록 의존성 배열을 비웠음

  return (
    <>
      <ModalWrapper>
        <UpdateModal
          data={LATEST_PATCH_NOTE}
          isChecked={isChecked}
          onChecked={setIsChecked}
        />
      </ModalWrapper>
    </>
  );
}
