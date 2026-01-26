// 이미지 임포트는 아래와 같이
import PatchNoteImage from '../assets/patchNote/0001.png';

export interface PatchNoteData {
  version: string; // 로컬 스토리지 키 관리를 위한 버전 (이 버전을 바꾸면 사용자의 '다시 보지 않기'가 초기화됨)
  title: string; // 패치 노트 제목
  description: string; // 패치 노트 설명
  image?: string; // 이미지는 선택 사항
  link?: string; // 외부 공지 링크 (Notion 등)
}

// 현재 활성화된 업데이트 데이터 (이 부분만 수정해서 배포하면 됨)
export const LATEST_PATCH_NOTE: PatchNoteData = {
  version: '0001',
  title: '피드백 & 투표',
  description:
    '토론 종료 후 피드백 & 투표 기능으로 다양한 서비스를 이용하세요!',
  image: PatchNoteImage,
  link: 'https://notion.so',
};
