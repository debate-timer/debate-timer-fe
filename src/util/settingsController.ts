import { SupportedLang } from './languageRouting';
export interface SettingsValues {
  language: SupportedLang | null;
  volume: number;
}
export interface SettingsSnapshot extends SettingsValues {
  status: 'saved' | 'pending' | 'saving' | 'error';
}
type Changes = Partial<{ language: SupportedLang; volume: number }>;
/** 직접 선택만 직렬 저장하며 늦은 응답과 계정 수명을 분리함. */
export class SettingsController {
  private snapshot: SettingsSnapshot = {
    language: null,
    volume: 0.5,
    status: 'saved',
  };
  private dirty: Changes = {};
  private selected: Changes = {};
  private inFlight: Changes = {};
  private listeners = new Set<() => void>();
  private timer?: ReturnType<typeof setTimeout>;
  private running?: Promise<boolean>;
  private disposed = false;
  constructor(
    private save: (changes: Changes) => Promise<SettingsValues>,
    private issue: (changes: Changes) => Promise<SettingsValues> = save,
  ) {}
  getSnapshot = () => this.snapshot;
  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };
  private publish(values: Partial<SettingsSnapshot>) {
    this.snapshot = { ...this.snapshot, ...values };
    this.listeners.forEach((listener) => listener());
  }
  load(values: SettingsValues) {
    if (!this.disposed) {
      this.publish({ ...values, ...this.selected });
    }
  }
  change(values: Changes) {
    if (values.volume !== undefined) {
      if (
        !Number.isFinite(values.volume) ||
        values.volume < 0 ||
        values.volume > 1
      ) {
        return;
      }
      values = { ...values, volume: Math.round(values.volume * 10) / 10 };
    }
    if (this.disposed) {
      return;
    }
    this.dirty = { ...this.dirty, ...values };
    this.selected = { ...this.selected, ...values };
    this.publish({ ...values, status: 'pending' });
    clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      void this.flush();
    }, 500);
  }
  flush = async (): Promise<boolean> => {
    clearTimeout(this.timer);
    if (this.disposed) {
      return false;
    }
    if (this.running) {
      const success = await this.running;
      return success ? this.flush() : false;
    }
    if (this.snapshot.status === 'error') {
      return false;
    }
    if (!Object.keys(this.dirty).length) {
      this.publish({ status: 'saved' });
      return true;
    }
    const changes = this.dirty;
    this.inFlight = changes;
    this.dirty = {};
    this.publish({ status: 'saving' });
    this.running = (async () => {
      try {
        const result = await this.save(changes);
        if (this.disposed) {
          return false;
        }
        this.publish({
          ...result,
          ...this.dirty,
          status: Object.keys(this.dirty).length ? 'pending' : 'saved',
        });
        return true;
      } catch {
        if (!this.disposed) {
          this.dirty = { ...changes, ...this.dirty };
          this.publish({ status: 'error' });
        }
        return false;
      }
    })();
    const success = await this.running;
    this.running = undefined;
    this.inFlight = {};
    return success ? this.flush() : false;
  };
  /** 최종 변경을 발행하고 응답을 기다리지 않는 로그아웃 전용 경계임. */
  issueBeforeLogout = (): void => {
    clearTimeout(this.timer);
    const changes = { ...this.inFlight, ...this.dirty };
    if (this.disposed || !Object.keys(changes).length) {
      return;
    }
    try {
      void this.issue(changes).catch(() => {});
    } catch {
      /* 발행 실패로 로그아웃을 차단하지 않음. */
    }
  };
  retry = async () => {
    if (!Object.keys(this.dirty).length && !Object.keys(this.selected).length) {
      try {
        this.load(await this.save({}));
        this.publish({ status: 'saved' });
        return true;
      } catch {
        this.fail();
        return false;
      }
    }
    if (!Object.keys(this.dirty).length) {
      this.dirty = { ...this.selected };
    }

    this.publish({ status: 'pending' });
    return this.flush();
  };
  hasDirectLanguage() {
    return this.selected.language !== undefined;
  }
  activate() {
    this.disposed = false;
  }
  fail() {
    this.publish({ status: 'error' });
  }
  dispose() {
    this.disposed = true;
    clearTimeout(this.timer);
  }
}

export function readGuestSettings(): SettingsValues {
  const raw = localStorage.getItem('timer-volume');
  const value = raw === null || raw.trim() === '' ? NaN : Number(raw);
  const language = localStorage.getItem('guest-settings-language');
  return {
    language: language === 'ko' || language === 'en' ? language : null,
    volume:
      Number.isFinite(value) && value >= 0 && value <= 1
        ? Math.round(value * 10) / 10
        : 0.5,
  };
}
export async function saveGuestSettings(
  changes: Changes,
): Promise<SettingsValues> {
  if (changes.language !== undefined) {
    localStorage.setItem('guest-settings-language', changes.language);
  }
  if (changes.volume !== undefined) {
    localStorage.setItem('timer-volume', String(changes.volume));
  }
  return readGuestSettings();
}
