interface PropsAndConsTitleProps {
  prosTeamName?: string;
  consTeamName?: string;
}

export default function PropsAndConsTitle({
  prosTeamName = '찬성',
  consTeamName = '반대',
}: PropsAndConsTitleProps) {
  return (
    <div className="mx-auto flex w-full items-center justify-between gap-2 py-4">
      <div className="flex w-1/2 flex-col items-center">
        <span className="text-2xl font-bold text-camp-blue">
          {prosTeamName}
        </span>
        <div className="mt-1 h-1 w-full bg-camp-blue" />
      </div>
      <div className="flex w-1/2 flex-col items-center">
        <span className="text-2xl font-bold text-camp-red">{consTeamName}</span>
        <div className="mt-1 h-1 w-full bg-camp-red" />
      </div>
    </div>
  );
}
