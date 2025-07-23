import { IconProps } from './IconProps';

export default function DTClose({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 39 38"
      fill="none"
      className={`
        aspect-[39/38]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4.02089 2.85052L36.7186 35.1505"
        stroke={color}
        strokeWidth="2.96541"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M36.7186 2.85052L4.02089 35.1505"
        stroke={color}
        strokeWidth="2.96541"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
