import { IconProps } from './IconProps';

export default function DTExpand({
  size = 24,
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 13 8"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.58212 7.4L0.582123 1.4L1.98212 0L6.58212 4.6L11.1821 0L12.5821 1.4L6.58212 7.4Z"
        fill={color}
      />
    </svg>
  );
}
