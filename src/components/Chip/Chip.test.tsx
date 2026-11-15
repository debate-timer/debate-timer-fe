import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Chip from './Chip';

describe('공용 칩', () => {
  it('내용과 접근성 속성을 전달하고 기본적으로 조작 요소가 되지 않는다', async () => {
    const user = userEvent.setup();
    render(
      <>
        <Chip aria-label="연결 상태" title="연결됨">
          연결됨
        </Chip>
        <button>다음 조작</button>
      </>,
    );
    expect(screen.getByLabelText('연결 상태')).toHaveTextContent('연결됨');
    expect(screen.getByLabelText('연결 상태')).toHaveAttribute(
      'title',
      '연결됨',
    );
    expect(
      screen.queryByRole('button', { name: '연결 상태' }),
    ).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: '다음 조작' })).toHaveFocus();
  });
});
