import { useEffect } from 'react';

/**
 * 문서 이탈 시 브라우저 기본 경고를 요청하며 비활성화·언마운트 시 구독을 해제함.
 * 탭 닫기·새로고침·문서를 교체하는 이동에 적용되고 SPA 내부 이동은 처리하지 않음.
 * 경고 문구와 실제 표시 여부는 브라우저가 결정하며 사전 사용자 상호작용이 필요함.
 */
export default function useBeforeUnloadGuard(isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      // preventDefault 처리가 다른 구형 브라우저도 경고를 요청하도록 설정함.
      event.returnValue = 'true';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isEnabled]);
}
