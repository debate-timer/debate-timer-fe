import { IconProps } from './IconProps';

export default function DTShareLive({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 46 35"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`
        aspect-[46/35]
        ${className}
      `}
      {...props}
    >
      <path
        d="M2.01439 8.34463L2.01439 3.62381C2.01439 2.55955 3.00914 1.69685 4.24951 1.69685L41.5344 1.69685C42.7625 1.69685 43.7695 2.55955 43.7695 3.62381L43.7695 30.448C43.7695 31.5123 42.7748 32.375 41.5344 32.375L26.9373 32.375"
        stroke={color}
        strokeWidth="3.3913"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M14.78 32.2585C14.78 25.2812 9.12377 19.625 2.14648 19.625"
        stroke={color}
        strokeWidth="3.3913"
        strokeLinecap="round"
      />
      <path
        d="M10.6193 31.8146C10.1479 27.6705 7.07727 24.2293 2.59019 23.7707C1.43023 23.6521 0.535156 24.6586 0.535156 25.8246V31.6108C0.535156 32.8595 1.54738 33.8717 2.79603 33.8717H8.57845C9.74605 33.8717 10.7513 32.9747 10.6193 31.8146Z"
        fill={color}
      />
      <path
        d="M32.6953 31.7773C32.6953 15.2088 18.8161 1.77734 1.69531 1.77734"
        stroke={color}
        strokeWidth="3.3913"
        strokeLinecap="round"
      />
    </svg>
  );
}
