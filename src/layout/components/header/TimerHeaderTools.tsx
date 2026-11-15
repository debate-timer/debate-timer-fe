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
import TimerDashboardButton from './TimerDashboardButton';
import IconButton from '../../../components/IconButton/IconButton';
import { HEADER_ICON_BUTTON_CLASS } from './headerActionStyles';

interface TimerHeaderToolsProps extends PropsWithChildren {
  onLogout?: () => Promise<void>;
  onLogin?: () => void;
}
const VOLUME_CLASS =
  'absolute top-full right-0 z-40 mt-2 w-64 rounded-xl border border-neutral-300 bg-white p-4 shadow-lg';

/** 세 타이머 화면의 전체 화면·공용 음량·대시보드 이동 확인·설정을 연결함. 토론 정리는 전달받은 콜백에 위임함. */
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
      <IconButton
        className={HEADER_ICON_BUTTON_CLASS}
        variant="secondary"
        shape="rounded"
        aria-label={t(isFullscreen ? '전체 화면 해제' : '전체 화면')}
        onClick={() => void toggleFullscreen()}
        icon={
          isFullscreen ? (
            <RiFullscreenExitFill aria-hidden="true" />
          ) : (
            <RiFullscreenFill aria-hidden="true" />
          )
        }
      />
      <div
        ref={volumeRef}
        className="relative"
        data-timer-overlay={isVolumeOpen ? '' : undefined}
      >
        <IconButton
          className={HEADER_ICON_BUTTON_CLASS}
          ref={volumeTrigger}
          variant="secondary"
          shape="rounded"
          aria-label={t('볼륨 조절')}
          aria-expanded={isVolumeOpen}
          onClick={() => setIsVolumeOpen((current) => !current)}
          icon={
            volume === 0 ? (
              <RiVolumeMuteFill
                data-testid="volume-icon-muted"
                aria-hidden="true"
              />
            ) : (
              <DTVolume data-testid="volume-icon-normal" aria-hidden="true" />
            )
          }
        />
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
      <TimerDashboardButton />
      <SettingsModal
        triggerClassName={HEADER_ICON_BUTTON_CLASS}
        onLogin={onLogin}
        onLogout={onLogout}
      />
    </>
  );
}
