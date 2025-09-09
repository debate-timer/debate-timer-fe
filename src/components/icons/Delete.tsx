import { IconProps } from './IconProps';

export default function DTDelete({
  color = 'currentColor',
  className = '',
  ...props
}: IconProps) {
  return (
    <svg
      viewBox="0 0 31 34"
      fill="none"
      className={`
        aspect-[31/34]
        ${className}
      `}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M6.35547 33.875C5.32422 33.875 4.44141 33.5078 3.70703 32.7734C2.97266 32.0391 2.60547 31.1562 2.60547 30.125V5.75H0.730469V2H10.1055V0.125H21.3555V2H30.7305V5.75H28.8555V30.125C28.8555 31.1562 28.4883 32.0391 27.7539 32.7734C27.0195 33.5078 26.1367 33.875 25.1055 33.875H6.35547ZM25.1055 5.75H6.35547V30.125H25.1055V5.75ZM10.1055 26.375H13.8555V9.5H10.1055V26.375ZM17.6055 26.375H21.3555V9.5H17.6055V26.375Z"
        fill={color}
      />
    </svg>
  );
}
