import { IconProps } from './IconProps';

export default function DTCheck({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 20 16"
      fill="none"
      className={`
        aspect-[20/16]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M17.6171 1.12323L19.0165 2.52362L19.1933 2.70038L6.83974 15.0539L6.66298 14.8771L1.06337 9.27655L0.886612 9.09979L1.06337 8.92303L2.46376 7.52362L2.64052 7.34686L6.83974 11.5461L17.2636 1.12323L17.4403 0.946472L17.6171 1.12323Z"
        fill={color}
        stroke={color}
        strokeWidth="0.5"
      />
    </svg>
  );
}
