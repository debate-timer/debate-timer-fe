interface ColorItemProps {
  className: string;
  title: string;
}

export default function ColorItem({ className, title }: ColorItemProps) {
  return (
    <div className="flex flex-row items-center justify-center space-x-4">
      <div
        className={`
            size-10 rounded-full shadow-xl
            ${className}
        `}
      ></div>
      <p className="text-detail">{title}</p>
    </div>
  );
}
