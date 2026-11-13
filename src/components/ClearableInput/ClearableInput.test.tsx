import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import ClearableInput from './ClearableInput';

describe('지울 수 있는 입력창', () => {
  it('클리어 버튼의 이름을 제공하고 클릭하면 지우기 콜백을 실행한다', async () => {
    const user = userEvent.setup();
    const onClear = vi.fn();
    render(
      <ClearableInput
        value="내용"
        readOnly
        onClear={onClear}
        aria-label="이름"
      />,
    );
    await user.click(screen.getByRole('button', { name: '입력 내용 지우기' }));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('입력 id가 없어도 오류와 연결하고 기존 설명을 보존한다', () => {
    render(
      <>
        <p id="hint">입력 안내</p>
        <ClearableInput
          value="내용"
          readOnly
          aria-label="이름"
          aria-describedby="hint"
          errorMessage="너무 길어요"
        />
      </>,
    );
    const input = screen.getByRole('textbox');
    expect(input).toHaveAccessibleDescription('입력 안내 너무 길어요');
    expect(screen.getByRole('alert').id).not.toBe('');
  });

  it('오류가 사라져도 외부 설명과 명시적인 입력 id를 유지한다', () => {
    const { rerender } = render(
      <ClearableInput
        id="name"
        value="내용"
        readOnly
        aria-describedby="hint"
        errorMessage="오류"
      />,
    );
    rerender(
      <ClearableInput
        id="name"
        value="내용"
        readOnly
        aria-describedby="hint"
      />,
    );
    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'name');
    expect(screen.getByRole('textbox')).toHaveAttribute(
      'aria-describedby',
      'hint',
    );
  });
});
