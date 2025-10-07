import { IconProps } from './IconProps';

export default function CheckBox({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      width="145"
      height="144"
      viewBox="0 0 145 144"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${className}`}
      {...props}
    >
      <g clipPath="url(#clip0_2060_9314)">
        <rect
          x="29.8008"
          y="28.8086"
          width="85.8702"
          height="85.8702"
          rx="9.54113"
          fill={color}
        />
        <path
          d="M63.1956 94.1637L44.1133 75.0814L50.7921 68.4026L63.1956 80.8061L94.6813 49.3203L101.36 55.9991L63.1956 94.1637Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_2060_9314">
          <rect
            x="15.2461"
            y="14.2559"
            width="114.976"
            height="114.976"
            rx="57.4881"
            fill="white"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
