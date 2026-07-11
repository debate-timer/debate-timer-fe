import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AudienceNormalTimer from './AudienceNormalTimer';

describe('AudienceNormalTimer', () => {
  it('남은 시간 레이블과 포맷팅된 시간을 올바르게 렌더링한다', () => {
    render(<AudienceNormalTimer remainingTime={65} />);

    // @AC-037: "남은 시간" 레이블은 i18next 번역을 통해 렌더링된다.
    expect(screen.getByText('남은 시간')).toBeInTheDocument();

    // @AC-036: remainingTime={65}일 때 화면에 01:05가 표시된다.
    expect(screen.getByText('01:05')).toBeInTheDocument();

    // @AC-038: 컴포넌트는 사용자 조작 요소 없이 props만으로 동일한 UI를 렌더링한다.
    // 버튼 등 조작 요소가 없는지 확인한다.
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
