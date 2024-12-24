import { TableProps } from '../../../type/type';

export default function Table({ name, type, time }: TableProps) {
  return (
    <section className="flex h-[200px] w-[500px] flex-col items-center rounded-md bg-red-200 p-5 duration-200 hover:scale-105">
      <h1 className=" text-5xl font-semibold">{name}</h1>
      <div className="flex w-full flex-grow flex-col items-start justify-center text-2xl font-semibold">
        <h1>유형 : {type}</h1>
        <h1>소요시간 : {time}</h1>
      </div>
    </section>
  );
}
