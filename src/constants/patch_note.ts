// 이미지 임포트는 아래와 같이
import PatchNoteImage from '../assets/patchNote/0001.png';

// 기본적인 패치 노트 인터페이스
interface BasePatchNoteData {
  version: string; // 로컬 스토리지 키 관리를 위한 버전 (이 버전을 바꾸면 사용자의 '다시 보지 않기'가 초기화됨)
  link: string;
  image: string;
}

// 사전 정의된 패치 노트 인터페이스
export interface PredefinedPatchNoteData extends BasePatchNoteData {
  mode: 'predefined';
  title: string;
  description: string;
}

// 이미지만 존재하는 패치 노트 인터페이스
export interface ImageOnlyPatchNoteData extends BasePatchNoteData {
  mode: 'image-only';
}

// 패치 노트 데이터 타입 (두 가지 인터페이스의 유니언 타입)
export type PatchNoteData = PredefinedPatchNoteData | ImageOnlyPatchNoteData;

// PatchNoteData 타입이 PredefinedPatchNoteData인지 ImagePatchNoteData인지 구별하는 함수
export function isPredefinedPatchNote(
  data: PatchNoteData,
): data is PredefinedPatchNoteData {
  // 'mode'가 'predefined'인지 확인
  return data.mode === 'predefined';
}

// 현재 활성화된 업데이트 데이터 (이 부분만 수정해서 배포하면 됨)
export const LATEST_PATCH_NOTE: PredefinedPatchNoteData = {
  mode: 'predefined',
  version: '0001',
  title: '피드백 & 투표',
  description:
    '토론 종료 후 피드백 & 투표 기능으로 다양한 서비스를 이용하세요!',
  image: PatchNoteImage,
  link: 'https://bustling-bathtub-b3a.notion.site/2f41550c60cf80f69227e3145f6e19cc?pvs=143',
};

// ImageOnlyPatchNoteData의 예시
/*
export const TEST_PATCH_NOTE: ImageOnlyPatchNoteData = {
  mode: 'image-only',
  version: '0001',
  image: PatchNoteImage,
  link: 'https://bustling-bathtub-b3a.notion.site/2f41550c60cf80f69227e3145f6e19cc?pvs=143',
};
*/
