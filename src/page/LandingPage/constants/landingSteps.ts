import { LocalizedAsset } from '../../../util/localizedAsset';

export interface LandingScene {
  id: string;
  /** 이미지 대체 문구이자 이미지가 없을 때 자리표시에 보여 줄 번역 키 */
  alt: string;
  /** 언어별 장면 이미지. 언어별 이미지가 준비되면 `{장면}.{ko|en}.webp`를 연결함. */
  assets: LocalizedAsset;
}

export interface LandingStep {
  id: string;
  label: string;
  title: string;
  description: string;
  scenes: LandingScene[];
  /** 서비스의 핵심 가치를 보여 주는 단계를 강조할 때 사용함 */
  isHighlighted?: boolean;
}

// TODO: 장면 이미지 에셋이 준비되면 assets에 연결함.
export const LANDING_STEPS: LandingStep[] = [
  {
    id: 'prepare',
    label: '준비',
    title: '어떤 형식이든, 한 번 만들어 두면 끝',
    description:
      '발언 순서부터 종소리, 작전 시간까지 그대로 저장해 두고, 언제든 다시 꺼내 써요.',
    scenes: [
      { id: 'composition', alt: '시간표 구성 화면', assets: {} },
      { id: 'dashboard', alt: '대시보드 화면', assets: {} },
    ],
  },
  {
    id: 'start',
    label: '시작',
    title: '링크 하나로 모두의 화면에',
    description:
      '스크린 여러 대 없이, 토론자와 청중이 각자 휴대폰으로 같은 타이머를 봐요.',
    scenes: [
      {
        id: 'share',
        alt: '타이머 공유 QR 화면과 모바일 공유 화면',
        assets: {},
      },
    ],
  },
  {
    id: 'run',
    label: '진행',
    title: '다음 발언도, 종소리도 자동으로',
    description: '타이머 담당, 종 담당은 이제 디베이트 타이머가 할게요.',
    scenes: [
      { id: 'timer', alt: '자동으로 넘어가는 타이머 화면', assets: {} },
      { id: 'bell', alt: '자동 종소리 설정 화면', assets: {} },
    ],
    isHighlighted: true,
  },
  {
    id: 'finish',
    label: '마무리',
    title: '피드백부터 승패 투표까지',
    description: '토론이 끝나면 바로 피드백 시간을 재고, QR로 승패를 투표해요.',
    scenes: [
      {
        id: 'feedback-vote',
        alt: '피드백 타이머와 승패 투표 화면',
        assets: {},
      },
    ],
  },
];
