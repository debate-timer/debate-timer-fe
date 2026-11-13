import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

interface LoadingSpinnerProps {
  /** 바깥 SVG의 크기를 지정하는 Tailwind 클래스임. */
  size?: string;
  /** 말풍선과 점이 공유하는 색상 클래스임. */
  color?: string;
}

const DOT_POSITIONS = [16, 24, 32];

/**
 * 말풍선 안의 점 세 개로 진행 중인 상태를 표시하며 움직임 감소 설정을 존중함.
 *
 * `LoadingSpinner`는 테두리 없는 원에 가까운 타원형 말풍선 안의 점 세 개가 1.2초 주기로 순서대로 상승·복귀하며 밝아지는 로딩 표시를 사용함. 점의 시작 간격은 160ms이며 `prefers-reduced-motion`에서는 움직임과 밝기 변화를 멈추고 말풍선·점·접근 가능한 로딩 안내를 유지함. `size`·`color`는 외부 크기와 전체 색상을 지정함.
 *
 */
export default function LoadingSpinner(props: LoadingSpinnerProps) {
  const { size = 'size-6', color = 'text-neutral-500' } = props;
  const { t } = useTranslation();

  return (
    <svg
      className={clsx('shrink-0', size, color)}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 48 48"
      fill="none"
      role="status"
      aria-label={t('데이터를 불러오고 있습니다...')}
    >
      <path
        d="M24 3C35.6 3 45 11.5 45 22S35.6 41 24 41c-2.5 0-4.9-.4-7.1-1.1L8 45l2.7-8.3C6 33.2 3 27.9 3 22 3 11.5 12.4 3 24 3Z"
        fill="currentColor"
        fillOpacity="0.12"
      />
      {DOT_POSITIONS.map((x, index) => (
        <circle
          key={x}
          cx={x}
          cy="22"
          r="2.5"
          fill="currentColor"
          className="animate-debate-dot motion-reduce:animate-none"
          style={{ animationDelay: `${index * 160}ms` }}
        />
      ))}
    </svg>
  );
}
