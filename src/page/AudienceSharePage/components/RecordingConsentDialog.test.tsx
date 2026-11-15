import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecordingConsentDialog from './RecordingConsentDialog';

describe('녹음 참여 동의', () => {
  it('녹음 사실과 쓰임새를 알린다', () => {
    render(<RecordingConsentDialog onConfirm={vi.fn()} onCancel={vi.fn()} />);

    expect(
      screen.getByRole('heading', { name: '토론 녹음에 참여할까요?' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('주변의 대화도 함께 녹음될 수 있습니다.'),
    ).toBeInTheDocument();
  });

  it('동의하면 참여를 시작하고 거절하면 참여하지 않는다', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <RecordingConsentDialog onConfirm={onConfirm} onCancel={onCancel} />,
    );

    await user.click(screen.getByRole('button', { name: '동의하고 참여' }));
    await user.click(screen.getByRole('button', { name: '참여하지 않기' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).toHaveBeenCalledTimes(1);
  });
});
