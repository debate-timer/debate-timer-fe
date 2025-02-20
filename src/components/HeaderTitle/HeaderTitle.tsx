interface HeaderTitleProps {
  title: string | undefined;
}

export default function HeaderTitle(props: HeaderTitleProps) {
  const { title } = props;
  const displayTitle =
    title === undefined || title.trim() === '' ? '주제 없음' : title;
  return <h1 className="text-3xl font-bold">{displayTitle}</h1>;
}
