import { IconProps } from './IconProps';

export default function DTLogin({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 45 44"
      fill="none"
      className={`
        aspect-[45/44]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M33.7567 32.464V35.681C33.7567 36.7666 33.1532 37.6466 32.4007 37.6466H9.78112C9.03607 37.6466 8.42514 36.7666 8.42514 35.681V8.31899C8.42514 7.23339 9.02862 6.35339 9.78112 6.35339H32.4081C33.1532 6.35339 33.7641 7.23339 33.7641 8.31899V11.536"
        stroke={color}
        strokeWidth="4.11753"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
      <path
        d="M36.4256 22.0014L30.0853 26.9688"
        stroke={color}
        strokeWidth="4.11753"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M36.4256 21.9977L30.0853 17.0385"
        stroke={color}
        strokeWidth="4.11753"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.4389 22.0014H34.2827"
        stroke={color}
        strokeWidth="4.11753"
        strokeMiterlimit="10"
        strokeLinecap="round"
      />
    </svg>
  );
}
