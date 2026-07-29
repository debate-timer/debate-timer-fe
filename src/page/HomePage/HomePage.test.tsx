import { render, screen } from '@testing-library/react';
import HomePage from './HomePage';

vi.mock('../LandingPage/LandingPage', () => ({
  default: () => <div>일반 랜딩 화면</div>,
}));

vi.mock('../MaintenancePage/MaintenancePage', () => ({
  default: () => <div>점검 화면</div>,
}));

describe('홈 화면 선택', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test.each([undefined, 'false', 'TRUE'])(
    '점검 환경 변수가 %s이면 일반 랜딩 화면을 표시한다',
    (value) => {
      vi.stubEnv('VITE_MAINTENANCE_MODE', value ?? '');

      render(<HomePage />);

      expect(screen.getByText('일반 랜딩 화면')).toBeInTheDocument();
      expect(screen.queryByText('점검 화면')).not.toBeInTheDocument();
    },
  );

  test('점검 환경 변수가 true이면 점검 화면을 표시한다', () => {
    vi.stubEnv('VITE_MAINTENANCE_MODE', 'true');

    render(<HomePage />);

    expect(screen.getByText('점검 화면')).toBeInTheDocument();
    expect(screen.queryByText('일반 랜딩 화면')).not.toBeInTheDocument();
  });
});
