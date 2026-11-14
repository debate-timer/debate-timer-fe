import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  RiFullscreenExitFill,
  RiFullscreenFill,
  RiVolumeMuteFill,
} from 'react-icons/ri';
import useFullscreen from '../../../hooks/useFullscreen';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import SettingsModal from '../../../components/SettingsModal/SettingsModal';
import DTVolume from '../../../components/icons/Volume';

interface TimerHeaderToolsProps extends PropsWithChildren {
  onLogout?: () => Promise<void>;
  onLogin?: () => void;
}
const BUTTON_CLASS =
  'flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-300 p-2 text-ui-label focus-visible:outline-2 focus-visible:outline-offset-2';
const VOLUME_CLASS =
  'absolute top-full right-0 z-40 mt-2 w-64 rounded-xl border border-neutral-300 bg-white p-4 shadow-lg';

/** 세 타이머 화면의 전체 화면·공용 음량·설정을 연결함. 토론 정리는 전달받은 콜백에 위임함. */
export default function TimerHeaderTools(props: TimerHeaderToolsProps) {
  const { children, onLogin, onLogout } = props;
  const { t } = useTranslation();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { volume, controller } = useGlobalSettings();
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const lastVolumeRef = useRef(0.5);
  const volumeRef = useRef<HTMLDivElement>(null);
  const volumeTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!isVolumeOpen) {
      return;
    }
    const close = () => {
      setIsVolumeOpen(false);
      void controller.flush();
    };
    const handleOutside = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !volumeRef.current?.contains(event.target)
      ) {
        close();
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        close();
        volumeTrigger.current?.focus();
      }
    };
    window.addEventListener('pointerdown', handleOutside);
    window.addEventListener('keydown', handleKey, true);
    return () => {
      window.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('keydown', handleKey, true);
    };
  }, [controller, isVolumeOpen]);
  return (
    <>
      {children}
      <button
        type="button"
        aria-label={t(isFullscreen ? '전체 화면 해제' : '전체 화면')}
        className={BUTTON_CLASS}
        onClick={() => void toggleFullscreen()}
      >
        {isFullscreen ? (
          <RiFullscreenExitFill className="size-6" aria-hidden="true" />
        ) : (
          <RiFullscreenFill className="size-6" aria-hidden="true" />
        )}
      </button>
      <div
        ref={volumeRef}
        className="relative"
        data-timer-overlay={isVolumeOpen ? '' : undefined}
      >
        <button
          ref={volumeTrigger}
          type="button"
          aria-label={t('볼륨 조절')}
          aria-expanded={isVolumeOpen}
          className={BUTTON_CLASS}
          onClick={() => setIsVolumeOpen((current) => !current)}
        >
          {volume === 0 ? (
            <RiVolumeMuteFill
              data-testid="volume-icon-muted"
              className="size-6"
              aria-hidden="true"
            />
          ) : (
            <DTVolume
              data-testid="volume-icon-normal"
              className="size-6"
              aria-hidden="true"
            />
          )}
        </button>
        {isVolumeOpen && (
          <div className={VOLUME_CLASS}>
            <label className="flex flex-col gap-2">
              {t('음량')}
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={Math.round(volume * 10)}
                onChange={(event) =>
                  controller.change({ volume: Number(event.target.value) / 10 })
                }
                onPointerUp={() => void controller.flush()}
                onKeyUp={() => void controller.flush()}
                onBlur={() => void controller.flush()}
              />
              <output>{Math.round(volume * 10)}</output>
            </label>
            <button
              type="button"
              aria-label={t(volume === 0 ? '음소거 해제' : '음소거')}
              title={t(volume === 0 ? '음소거 해제' : '음소거')}
              onClick={() => {
                if (volume > 0) {
                  lastVolumeRef.current = volume;
                }
                controller.change({
                  volume: volume > 0 ? 0 : lastVolumeRef.current,
                });
                void controller.flush();
              }}
            >
              {t(volume === 0 ? '음소거 해제' : '음소거')}
            </button>
          </div>
        )}
      </div>
      <SettingsModal onLogin={onLogin} onLogout={onLogout} />
    </>
  );
}
