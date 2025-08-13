import { IconProps } from './IconProps';

export default function DTPlay({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 59 67"
      fill="none"
      className={`
        aspect-[59/67]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M56.6871 30.2524C59.1871 31.6958 59.1871 35.3042 56.6871 36.7476L5.73172 66.1667C3.23172 67.6101 0.106717 65.8059 0.106717 62.9191L0.106719 4.08088C0.10672 1.19413 3.23172 -0.610097 5.73172 0.833279L56.6871 30.2524Z"
        fill={color}
      />
    </svg>
  );
}
