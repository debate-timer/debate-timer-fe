interface TableProps {
  name: string;
  type: string;
  time: number;
}

export default function Table({ name, type, time }: TableProps) {
  return (
    <section className="w-[300px] p-2">
      <h1>{name}</h1>
      <div>유형 : {type}</div>
      <div>소요시간 : {time}</div>
    </section>
  );
}
