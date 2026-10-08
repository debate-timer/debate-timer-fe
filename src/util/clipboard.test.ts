import { vi } from 'vitest';
import { copyToClipboard } from './clipboard';

const TEXT = 'https://example.com/live/1';

function mockClipboard(writeText?: (text: string) => Promise<void>) {
  Object.defineProperty(navigator, 'clipboard', {
    configurable: true,
    value: writeText ? { writeText } : undefined,
  });
}

function mockExecCommand(result: boolean) {
  const execCommand = vi.fn().mockReturnValue(result);
  Object.defineProperty(document, 'execCommand', {
    configurable: true,
    value: execCommand,
  });
  return execCommand;
}

describe('copyToClipboard', () => {
  afterEach(() => {
    mockClipboard();
  });

  test('Clipboard API가 있으면 writeText로 복사한다', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    mockClipboard(writeText);
    const execCommand = mockExecCommand(true);

    await expect(copyToClipboard(TEXT)).resolves.toBe(true);

    expect(writeText).toHaveBeenCalledWith(TEXT);
    expect(execCommand).not.toHaveBeenCalled();
  });

  test('Clipboard API가 없으면 execCommand로 폴백한다', async () => {
    mockClipboard();
    const execCommand = mockExecCommand(true);

    await expect(copyToClipboard(TEXT)).resolves.toBe(true);

    expect(execCommand).toHaveBeenCalledWith('copy');
    expect(document.querySelector('textarea')).not.toBeInTheDocument();
  });

  test('writeText가 실패하면 execCommand로 폴백한다', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    const execCommand = mockExecCommand(true);

    await expect(copyToClipboard(TEXT)).resolves.toBe(true);

    expect(execCommand).toHaveBeenCalledWith('copy');
  });

  test('모든 복사 방법이 실패하면 false를 반환한다', async () => {
    mockClipboard(vi.fn().mockRejectedValue(new Error('denied')));
    mockExecCommand(false);

    await expect(copyToClipboard(TEXT)).resolves.toBe(false);
  });
});
