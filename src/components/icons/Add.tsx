import { IconProps } from './IconProps';

export default function DTAdd({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 15 14"
      fill="none"
      className={`
        aspect-[15/14]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.88464 8H0.884644V6H6.88464V0H8.88464V6H14.8846V8H8.88464V14H6.88464V8Z"
        fill={color}
      />
    </svg>
  );
}
