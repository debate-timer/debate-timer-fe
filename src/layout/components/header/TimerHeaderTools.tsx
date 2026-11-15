import { PropsWithChildren, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { RiFullscreenExitFill, RiFullscreenFill } from 'react-icons/ri';
import {
  IoVolumeMuteSharp,
  IoVolumeLowSharp,
  IoVolumeMediumSharp,
  IoVolumeHighSharp,
} from 'react-icons/io5';
import useFullscreen from '../../../hooks/useFullscreen';
import useGlobalSettings from '../../../hooks/useGlobalSettings';
import SettingsModal from '../../../components/SettingsModal/SettingsModal';
import CustomRangeSlider from '../../../components/CustomRangeSlider/CustomRangeSlider';
import TimerDashboardButton from './TimerDashboardButton';
import IconButton from '../../../components/IconButton/IconButton';
import Overlay from '../../../components/Overlay/Overlay';
import { HEADER_ICON_BUTTON_CLASS } from './headerActionStyles';

interface TimerHeaderToolsProps extends PropsWithChildren {
  onLogout?: () => Promise<void>;
  onLogin?: () => void;
}
const VOLUME_CLASS = 'absolute top-full right-0 z-40 mt-2 w-64';

/**
 * 세 타이머 화면의 전체 화면·공용 음량·대시보드 이동 확인·설정을 연결함.
 * 음량은 제목 아래 아이콘 버튼과 공용 슬라이더를 가로로 배치하며 UI 0~10을 설정값 0~1로 변환함.
 * 아이콘은 0·1~3·4~6·7~10을 음소거·작음·중간·큼으로 구분함.
 * 음소거 해제는 이 헤더 수명에서 마지막 양수 음량을 복원하며 기록이 없으면 5를 사용함.
 * 토론 정리는 전달받은 콜백에 위임함.
 */
export default function TimerHeaderTools(props: TimerHeaderToolsProps) {
  const { children, onLogin, onLogout } = props;
  const { t } = useTranslation();
  const { isFullscreen, toggleFullscreen } = useFullscreen();
  const { volume, controller } = useGlobalSettings();
  const volumeLevel = Math.round(volume * 10);
  const volumeIconLevel =
    volumeLevel === 0
      ? 'mute'
      : volumeLevel <= 3
        ? 'low'
        : volumeLevel <= 6
          ? 'medium'
          : 'high';
  const VolumeIcon =
    volumeIconLevel === 'mute'
      ? IoVolumeMuteSharp
      : volumeIconLevel === 'low'
        ? IoVolumeLowSharp
        : volumeIconLevel === 'medium'
          ? IoVolumeMediumSharp
          : IoVolumeHighSharp;
  const [isVolumeOpen, setIsVolumeOpen] = useState(false);
  const lastVolumeRef = useRef(0.5);
  const volumeRef = useRef<HTMLDivElement>(null);
  const volumeTrigger = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (volumeLevel > 0) {
      lastVolumeRef.current = volume;
    }
  }, [volume, volumeLevel]);
  const handleVolumeChange = (level: number) => {
    if (level > 0) {
      lastVolumeRef.current = level / 10;
    }
    controller.change({ volume: level / 10 });
  };
  const handleMute = () => {
    controller.change({ volume: volumeLevel > 0 ? 0 : lastVolumeRef.current });
    void controller.flush();
  };
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
            <VolumeIcon
              data-testid={
                volumeLevel === 0 ? 'volume-icon-muted' : 'volume-icon-normal'
              }
              aria-hidden="true"
            />
          }
        />
        <Overlay
          isOpen={isVolumeOpen}
          className={VOLUME_CLASS}
          direction="down"
        >
          <h3 className="mb-3 text-ui-label">{t('음량')}</h3>
          <div className="flex items-center gap-1">
            <IconButton
              variant="text"
              shape="rounded"
              className="size-11! shrink-0 [&>svg]:size-6!"
              aria-label={t(volumeLevel === 0 ? '음소거 해제' : '음소거')}
              title={t(volumeLevel === 0 ? '음소거 해제' : '음소거')}
              onClick={handleMute}
              icon={
                <VolumeIcon
                  data-testid={`volume-control-icon-${volumeIconLevel}`}
                  aria-hidden="true"
                />
              }
            />
            <div className="flex min-w-0 flex-1">
              <CustomRangeSlider
                ariaLabel={t('음량')}
                min={0}
                max={10}
                step={1}
                value={volumeLevel}
                onValueChange={handleVolumeChange}
                onValueCommit={() => void controller.flush()}
              />
            </div>
          </div>
        </Overlay>
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
