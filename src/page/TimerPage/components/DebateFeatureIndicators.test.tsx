import { render, screen, cleanup } from '@testing-library/react';
import DebateFeatureIndicators from './DebateFeatureIndicators';

afterEach(cleanup);

describe('토론 기능 상태 표시', () => {
  it('각 도구의 이름과 상태를 접근 가능한 아이콘 행으로 제공한다', () => {
    render(
      <DebateFeatureIndicators
        statuses={{ share: 'inactive', transcript: 'error', answer: 'active' }}
      />,
    );
    for (const name of [
      '실시간 공유: 비활성화',
      '속기록: 오류',
      '답변 시간: 활성화',
    ]) {
      expect(screen.getByRole('listitem', { name })).toHaveAttribute(
        'tabindex',
        '0',
      );
    }
  });
});
