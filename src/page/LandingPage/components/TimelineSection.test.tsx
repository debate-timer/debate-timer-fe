import { render, screen, within } from '@testing-library/react';
import TimelineSection from './TimelineSection';
import { LandingStep } from '../constants/landingSteps';

const STEPS: LandingStep[] = [
  {
    id: 'prepare',
    label: '준비',
    title: '첫 단계 제목',
    description: '첫 단계 설명',
    scenes: [{ id: 'composition', alt: '시간표 구성 화면', assets: {} }],
  },
  {
    id: 'run',
    label: '진행',
    title: '둘째 단계 제목',
    description: '둘째 단계 설명',
    scenes: [
      {
        id: 'timer',
        alt: '타이머 화면',
        assets: { ko: '/timer.ko.webp', en: '/timer.en.webp' },
      },
    ],
    isHighlighted: true,
  },
];

describe('토론 흐름 타임라인', () => {
  beforeEach(() => {
    vi.stubGlobal('IntersectionObserver', undefined);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('현재 보고 있는 단계를 표시한다', () => {
    render(<TimelineSection steps={STEPS} />);

    const items = screen.getAllByRole('listitem');
    expect(items[0]).toHaveAttribute('aria-current', 'step');
    expect(items[1]).not.toHaveAttribute('aria-current');
  });

  it('단계마다 번호·이름·제목·설명을 순서대로 보여 준다', () => {
    render(<TimelineSection steps={STEPS} />);

    const items = screen.getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(within(items[0]).getByText('1')).toBeInTheDocument();
    expect(within(items[0]).getByText('준비')).toBeInTheDocument();
    expect(
      within(items[0]).getByRole('heading', { name: '첫 단계 제목' }),
    ).toBeInTheDocument();
    expect(within(items[1]).getByText('둘째 단계 설명')).toBeInTheDocument();
  });

  it('장면 이미지가 있으면 현재 언어 이미지를, 없으면 자리표시를 보여 준다', () => {
    render(<TimelineSection steps={STEPS} />);

    expect(screen.getByRole('img', { name: '타이머 화면' })).toHaveAttribute(
      'src',
      '/timer.ko.webp',
    );
    expect(screen.getByText('시간표 구성 화면')).toBeInTheDocument();
  });

  it('단계에 끼워 넣을 내용을 해당 단계 아래에 보여 준다', () => {
    render(
      <TimelineSection
        steps={STEPS}
        renderStepExtra={(step) =>
          step.id === 'prepare' ? <p>템플릿 영역</p> : null
        }
      />,
    );

    const items = screen.getAllByRole('listitem');
    expect(within(items[0]).getByText('템플릿 영역')).toBeInTheDocument();
    expect(within(items[1]).queryByText('템플릿 영역')).not.toBeInTheDocument();
  });
});
