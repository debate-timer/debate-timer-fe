// Integer 1-10, step = 1
// Mute button available
import { useState } from 'react';
import CustomRangeSlider from '../CustomRangeSlider/CustomRangeSlider';
import DTVolume from '../icons/Volume';
import clsx from 'clsx';

interface VolumeBarProps {
  volume: number;
  onVolumeChange: (volume: number) => void;
  className?: string;
}

const MIN_VOLUME = 0;
const MAX_VOLUME = 10;
const STEP_VOLUME = 1;

export default function VolumeBar({
  volume,
  onVolumeChange,
  className = '',
}: VolumeBarProps) {
  // 음소거 해제 시 가장 마지막의 볼륨 값을 복원하기 위함
  const [lastVolume, setLastVolume] = useState(volume > 0 ? volume : 5);

  // 음소거 로직
  const handleMute = () => {
    if (volume === 0) {
      onVolumeChange(lastVolume === 0 ? 1 : lastVolume);
    } else {
      setLastVolume(volume);
      onVolumeChange(0);
    }
  };

  // 음소거 버튼은 오직 볼륨이 0일 때에만 흐리게 강조됨
  const isMuteButtonHighlighted = volume > 0;

  return (
    <div className={`relative h-[76px] w-[234px] ${className}`}>
      {/* SVG Layer */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 234 76"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none" // Ensures SVG stretches if container resizes
      >
        <g filter="url(#filter0_d_2434_13098)">
          <mask id="path-1-inside-1_2434_13098" fill="white">
            <path d="M164.025 18.1911C164.386 18.7925 165.037 19.1603 165.738 19.1603H227C228.105 19.1603 229 20.0558 229 21.1603V65.1662C229 66.2708 228.105 67.1662 227 67.1662H7.00001C5.89544 67.1662 5 66.2708 5 65.1662V21.1603C5 20.0558 5.89543 19.1603 7 19.1603H140.574C141.276 19.1603 141.926 18.7925 142.288 18.1911L151.442 2.96925C152.22 1.67692 154.093 1.67692 154.87 2.96925L164.025 18.1911Z" />
          </mask>
          <path
            d="M164.025 18.1911C164.386 18.7925 165.037 19.1603 165.738 19.1603H227C228.105 19.1603 229 20.0558 229 21.1603V65.1662C229 66.2708 228.105 67.1662 227 67.1662H7.00001C5.89544 67.1662 5 66.2708 5 65.1662V21.1603C5 20.0558 5.89543 19.1603 7 19.1603H140.574C141.276 19.1603 141.926 18.7925 142.288 18.1911L151.442 2.96925C152.22 1.67692 154.093 1.67692 154.87 2.96925L164.025 18.1911Z"
            fill="white"
          />
          <path
            d="M151.442 2.96925L150.757 2.55695L151.442 2.96925ZM154.87 2.96925L155.556 2.55695L154.87 2.96925ZM142.288 18.1911L142.974 18.6034L142.288 18.1911ZM164.025 18.1911L163.339 18.6034L164.025 18.1911ZM165.738 19.1603V19.9603H227V19.1603V18.3603H165.738V19.1603ZM229 21.1603H228.2V65.1662H229H229.8V21.1603H229ZM227 67.1662V66.3662H7.00001V67.1662V67.9662H227V67.1662ZM5 65.1662H5.8V21.1603H5H4.2V65.1662H5ZM7 19.1603V19.9603H140.574V19.1603V18.3603H7V19.1603ZM142.288 18.1911L142.974 18.6034L152.128 3.38155L151.442 2.96925L150.757 2.55695L141.602 17.7788L142.288 18.1911ZM154.87 2.96925L154.185 3.38155L163.339 18.6034L164.025 18.1911L164.71 17.7788L155.556 2.55695L154.87 2.96925ZM151.442 2.96925L152.128 3.38155C152.594 2.60615 153.718 2.60615 154.185 3.38155L154.87 2.96925L155.556 2.55695C154.468 0.747682 151.845 0.747684 150.757 2.55695L151.442 2.96925ZM140.574 19.1603V19.9603C141.557 19.9603 142.467 19.4454 142.974 18.6034L142.288 18.1911L141.602 17.7788C141.385 18.1396 140.995 18.3603 140.574 18.3603V19.1603ZM5 21.1603H5.8C5.8 20.4976 6.33726 19.9603 7 19.9603V19.1603V18.3603C5.4536 18.3603 4.2 19.6139 4.2 21.1603H5ZM7.00001 67.1662V66.3662C6.33726 66.3662 5.8 65.8289 5.8 65.1662H5H4.2C4.2 66.7126 5.45361 67.9662 7.00001 67.9662V67.1662ZM229 65.1662H228.2C228.2 65.8289 227.663 66.3662 227 66.3662V67.1662V67.9662C228.546 67.9662 229.8 66.7126 229.8 65.1662H229ZM227 19.1603V19.9603C227.663 19.9603 228.2 20.4976 228.2 21.1603H229H229.8C229.8 19.6139 228.546 18.3603 227 18.3603V19.1603ZM165.738 19.1603V18.3603C165.317 18.3603 164.927 18.1396 164.71 17.7788L164.025 18.1911L163.339 18.6034C163.845 19.4454 164.756 19.9603 165.738 19.9603V19.1603Z"
            fill="#D6D7D9"
            mask="url(#path-1-inside-1_2434_13098)"
          />
        </g>
        <defs>
          <filter
            id="filter0_d_2434_13098"
            x="0"
            y="0"
            width="234"
            height="76"
            filterUnits="userSpaceOnUse"
            colorInterpolationFilters="sRGB"
          >
            <feFlood floodOpacity="0" result="BackgroundImageFix" />
            <feColorMatrix
              in="SourceAlpha"
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
              result="hardAlpha"
            />
            <feOffset dy="3" />
            <feGaussianBlur stdDeviation="2.5" />
            <feComposite in2="hardAlpha" operator="out" />
            <feColorMatrix
              type="matrix"
              values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0"
            />
            <feBlend
              mode="normal"
              in2="BackgroundImageFix"
              result="effect1_dropShadow_2434_13098"
            />
            <feBlend
              mode="normal"
              in="SourceGraphic"
              in2="effect1_dropShadow_2434_13098"
              result="shape"
            />
          </filter>
        </defs>
      </svg>

      {/* Content Layer */}
      <div className="relative z-10 flex h-full w-full items-center justify-center px-4 pb-2 pt-5">
        <div className="flex w-full flex-row items-center gap-2">
          <button onClick={handleMute} className="size-[36px]">
            <DTVolume
              className={clsx('size-full', {
                'text-default-black': isMuteButtonHighlighted,
                'text-default-disabled/hover': !isMuteButtonHighlighted,
              })}
            />
          </button>
          <CustomRangeSlider
            value={volume}
            onValueChange={(value: number) => {
              onVolumeChange(value);

              // 마지막 볼륨이 0으로 저장되면, 음소거를 해제해도 음소거가 유지되는 버그를 피하기 위함
              if (value > 0) {
                setLastVolume(value);
              }
            }}
            min={MIN_VOLUME}
            max={MAX_VOLUME}
            step={STEP_VOLUME}
          />
        </div>
      </div>
    </div>
  );
}
