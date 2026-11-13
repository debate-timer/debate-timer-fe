import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import DialogModal from './DialogModal';

describe('공용 확인창', () => {
  it('본문과 양쪽 버튼을 표시하고 키보드와 클릭으로 각 콜백을 실행한다', async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    const onConfirm = vi.fn();
    render(
      <DialogModal
        left={{ text: '취소', onClick: onCancel }}
        right={{ text: '확인', onClick: onConfirm, isBold: true }}
      >
        <h2>변경 사항 확인</h2>
      </DialogModal>,
    );
    expect(
      screen.getByRole('heading', { name: '변경 사항 확인' }),
    ).toBeInTheDocument();
    await user.tab();
    expect(screen.getByRole('button', { name: '취소' })).toHaveFocus();
    await user.keyboard('{Enter}');
    await user.click(screen.getByRole('button', { name: '확인' }));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledTimes(1);
  });

  it.each(['left', 'right'] as const)(
    '%s 버튼 하나만 있어도 폼을 제출하지 않는다',
    async (side) => {
      const user = userEvent.setup();
      const onSubmit = vi.fn((event) => event.preventDefault());
      const onClick = vi.fn();
      render(
        <form onSubmit={onSubmit}>
          <DialogModal {...{ [side]: { text: '닫기', onClick } }}>
            안내
          </DialogModal>
        </form>,
      );
      const button = screen.getByRole('button', { name: '닫기' });
      expect(screen.getAllByRole('button')).toHaveLength(1);
      expect(button).toHaveAttribute('aria-label', '닫기');
      await user.click(button);
      expect(onClick).toHaveBeenCalledTimes(1);
      expect(onSubmit).not.toHaveBeenCalled();
    },
  );

  it('버튼을 전달하지 않으면 본문만 표시한다', () => {
    render(<DialogModal>안내 내용</DialogModal>);
    expect(screen.getByText('안내 내용')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
