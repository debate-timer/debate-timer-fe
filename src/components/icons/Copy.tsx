import { IconProps } from './IconProps';

export default function DTCopy({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 32 36"
      fill="none"
      className={`
        aspect-[32/36]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <mask id="path-1-inside-1_1098_3471" fill="white">
        <rect x="7.46484" y="6.72852" width="24.1621" height="29.1133" rx="3" />
      </mask>
      <rect
        x="7.46484"
        y="6.72852"
        width="24.1621"
        height="29.1133"
        rx="3"
        stroke={color}
        strokeWidth="8"
        mask="url(#path-1-inside-1_1098_3471)"
      />
      <path
        d="M23.6348 2.1582H5.73047C4.07361 2.1582 2.73047 3.50135 2.73047 5.1582V25.6456"
        stroke={color}
        strokeWidth="4"
      />
    </svg>
  );
}
