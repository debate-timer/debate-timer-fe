import { IconProps } from './IconProps';

export default function DTLogin({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 28 30"
      fill="none"
      className={`
        aspect-[28/30]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M24.2115 24.0371V26.8155C24.2115 27.753 23.6903 28.513 23.0404 28.513H3.50533C2.86189 28.513 2.33426 27.753 2.33426 26.8155V3.18459C2.33426 2.24702 2.85545 1.48703 3.50533 1.48703H23.0468C23.6903 1.48703 24.2179 2.24702 24.2179 3.18459V5.96294"
        stroke={color}
        strokeWidth="2.7"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M26.5165 15.0012L21.0407 19.2913"
        stroke={color}
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.5165 14.998L21.0407 10.715"
        stroke={color}
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.25525 15.0012H24.6658"
        stroke={color}
        strokeWidth="2.7"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
