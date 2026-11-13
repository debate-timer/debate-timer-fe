import { SettingsController } from './settingsController';

describe('전역 설정 저장', () => {
  it('직접 변경한 필드만 저장하고 서버 응답을 적용한다', async () => {
    const save = vi.fn().mockResolvedValue({ language: null, volume: 0.7 });
    const controller = new SettingsController(save);
    controller.change({ volume: 0.7 });
    await controller.flush();
    expect(save).toHaveBeenCalledWith({ volume: 0.7 });
    expect(controller.getSnapshot().volume).toBe(0.7);
    controller.dispose();
  });
  it('실패하면 적용값과 미저장 변경을 유지하고 수동으로 재시도한다', async () => {
    const save = vi
      .fn()
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValue({ language: 'en', volume: 0.5 });
    const controller = new SettingsController(save);
    controller.change({ language: 'en' });
    expect(await controller.flush()).toBe(false);
    expect(controller.getSnapshot().language).toBe('en');
    expect(controller.getSnapshot().status).toBe('error');
    expect(await controller.retry()).toBe(true);
    controller.dispose();
  });
  it('늦은 조회가 직접 선택을 덮어쓰지 않는다', () => {
    const controller = new SettingsController(vi.fn());
    controller.change({ volume: 0.9 });
    controller.load({ language: 'ko', volume: 0.2 });
    expect(controller.getSnapshot().volume).toBe(0.9);
    controller.dispose();
  });
});

it('연속 변경은 직렬로 최신값을 저장한다', async () => {
  let finish!: (value: { language: null; volume: number }) => void;
  const save = vi
    .fn()
    .mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    )
    .mockResolvedValue({ language: null, volume: 0.9 });
  const controller = new SettingsController(save);
  controller.change({ volume: 0.2 });
  const done = controller.flush();
  controller.change({ volume: 0.9 });
  expect(save).toHaveBeenCalledTimes(1);
  finish({ language: null, volume: 0.2 });
  await done;
  expect(save).toHaveBeenLastCalledWith({ volume: 0.9 });
  expect(controller.getSnapshot().volume).toBe(0.9);
  controller.dispose();
});
it('폐기된 계정의 응답은 적용하지 않는다', async () => {
  let finish!: (value: { language: null; volume: number }) => void;
  const controller = new SettingsController(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  controller.change({ volume: 0.2 });
  const done = controller.flush();
  controller.dispose();
  finish({ language: null, volume: 0.1 });
  expect(await done).toBe(false);
  expect(controller.getSnapshot().volume).toBe(0.2);
});
it('직접 선택 없는 늦은 조회를 적용한다', () => {
  const controller = new SettingsController(vi.fn());
  controller.load({ language: 'en', volume: 0.2 });
  expect(controller.getSnapshot().language).toBe('en');
  expect(controller.hasDirectLanguage()).toBe(false);
  controller.dispose();
});
it('500ms로 묶고 실패 후 자동 반복 없이 다음 직접 변경 때 재시도한다', async () => {
  vi.useFakeTimers();
  const save = vi.fn().mockRejectedValue(new Error('offline'));
  const controller = new SettingsController(save);
  try {
    controller.change({ volume: 0.1 });
    await vi.advanceTimersByTimeAsync(300);
    controller.change({ volume: 0.7 });
    await vi.advanceTimersByTimeAsync(499);
    expect(save).not.toHaveBeenCalled();
    await vi.advanceTimersByTimeAsync(1);
    expect(save).toHaveBeenCalledWith({ volume: 0.7 });
    await vi.advanceTimersByTimeAsync(2000);
    expect(save).toHaveBeenCalledTimes(1);
    controller.change({ volume: 0.9 });
    await vi.advanceTimersByTimeAsync(500);
    expect(save).toHaveBeenCalledTimes(2);
    expect(save).toHaveBeenLastCalledWith({ volume: 0.9 });
    expect(controller.getSnapshot().status).toBe('error');
  } finally {
    controller.dispose();
    vi.useRealTimers();
  }
});

it('로그아웃 직전에는 진행 중 요청을 기다리지 않고 최신 미저장 필드를 발행한다', () => {
  const save = vi.fn(() => new Promise<never>(() => {}));
  const issue = vi.fn(() => new Promise<never>(() => {}));
  const controller = new SettingsController(save, issue);
  controller.change({ volume: 0.2 });
  void controller.flush();
  controller.change({ language: 'en', volume: 0.9 });
  controller.issueBeforeLogout();
  expect(issue).toHaveBeenCalledWith({ language: 'en', volume: 0.9 });
  controller.dispose();
});
it('로그아웃 직전 발행 실패는 처리되지 않은 거절로 전파하지 않는다', async () => {
  const issue = vi.fn().mockRejectedValue(new Error('offline'));
  const controller = new SettingsController(issue, issue);
  controller.change({ volume: 0.8 });
  await controller.flush();
  controller.issueBeforeLogout();
  expect(issue).toHaveBeenCalledTimes(2);
  await Promise.resolve();
  controller.dispose();
});
it('미변경 기본값은 로그아웃 직전에 발행하지 않는다', () => {
  const save = vi.fn();
  const controller = new SettingsController(save, save);
  controller.issueBeforeLogout();
  expect(save).not.toHaveBeenCalled();
  controller.dispose();
});
