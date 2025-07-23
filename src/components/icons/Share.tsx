import { IconProps } from './IconProps';

export default function DTShare({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 13 18"
      fill="none"
      className={`
        aspect-[13/18]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.68109 5.96457V7.55734H2.44183V15.6677H11.2983V7.55734H9.05902V5.96457H11.3481C12.1966 5.96457 12.8911 6.65127 12.8911 7.50754V15.7175C12.891 16.5661 12.1967 17.2605 11.3481 17.2605H2.39203C1.53577 17.2605 0.849068 16.566 0.84906 15.7175V7.50754C0.84906 6.65144 1.53593 5.96457 2.39203 5.96457H4.68109ZM6.9057 0.754608L9.92621 3.77512L8.79535 4.90598L8.76019 4.87082L7.65863 3.76828V12.0359H6.08148V3.76828L4.97992 4.87082L4.94476 4.90598L4.90863 4.87082L3.84906 3.81027L3.8139 3.77512L6.86957 0.719452L6.9057 0.754608Z"
        fill={color}
        stroke={color}
        strokeWidth="0.1"
      />
    </svg>
  );
}
