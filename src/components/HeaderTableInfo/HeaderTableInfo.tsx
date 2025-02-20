interface HeaderTitleProps {
  name?: string;
}

export default function HeaderTableInfo(props: HeaderTitleProps) {
  const { name } = props;
  const displayName = !name?.trim() ? '테이블 이름 없음' : name.trim();
  return (
    <div className="flex flex-col space-y-[4px]">
      <h1 className="text-sm">의회식</h1>
      <h1 className="text-2xl font-bold">{displayName}</h1>
    </div>
  );
}
