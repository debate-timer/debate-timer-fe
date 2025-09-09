import { IconProps } from './IconProps';

export default function DTBell({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 23 23"
      fill="none"
      className={`
        aspect-[23/23]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M2.00118 9.07649C1.96653 7.21088 2.68174 3.05601 5.81984 1.36133"
        stroke={color}
        strokeWidth="2.18392"
      />
      <path
        d="M21.6941 9.07649C21.7288 7.21088 21.0136 3.05601 17.8755 1.36133"
        stroke={color}
        strokeWidth="2.18392"
      />
      <rect
        x="5.2168"
        y="8.85938"
        width="13.2592"
        height="6.99643"
        fill={color}
      />
      <path
        d="M11.8464 2.24805C8.18495 2.24805 5.2168 5.2081 5.2168 8.85952H18.4759C18.4759 5.2081 15.5078 2.24805 11.8464 2.24805Z"
        fill={color}
      />
      <ellipse
        cx="11.8442"
        cy="2.75459"
        rx="1.35006"
        ry="1.50459"
        fill={color}
      />
      <path
        d="M11.8437 19.0266H4.00289C3.57074 19.0266 3.30989 18.5484 3.54384 18.1851L5.21743 15.5859H11.8437V19.0266Z"
        fill={color}
      />
      <path
        d="M11.8437 19.0266H19.6846C20.1167 19.0266 20.3776 18.5484 20.1436 18.1851L18.47 15.5859H11.8437V19.0266Z"
        fill={color}
      />
      <path
        d="M11.8443 22.6177C13.0753 22.6177 14.0733 21.6197 14.0733 20.3887H9.61523C9.61523 21.6197 10.6132 22.6177 11.8443 22.6177Z"
        fill={color}
      />
    </svg>
  );
}
