interface HeaderTitleProps {
  title?: string;
}

export default function HeaderTitle({ title }: HeaderTitleProps) {
  const displayTitle = !title?.trim() ? '주제 없음' : title.trim();

  return (
    <h1 className="text-title w-full max-w-[50vw] overflow-hidden text-ellipsis whitespace-nowrap">
      {displayTitle}
    </h1>
  );
}
