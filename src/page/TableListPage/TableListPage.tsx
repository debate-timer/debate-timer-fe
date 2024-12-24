import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import Table from '../LoginPage/components/Table';

const data = [
  { name: '테이블1', type: '의회식 토론', time: 30 },
  { name: '테이블 2', type: '의회식 토론', time: 30 },
  { name: '테이블 3', type: '의회식 토론', time: 30 },
  { name: '테이블 4', type: '의회식 토론', time: 30 },
  { name: '테이블 5', type: '의회식 토론', time: 30 },
];

interface TableProps {
  name: string;
  type: string;
  time: number;
}

export default function TableListPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>테이블 목록화면</DefaultLayout.Header.Left>
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col border-2 border-red-200 px-4 py-6">
        <main className="grid grid-cols-3 justify-items-center gap-4">
          {data.map((table: TableProps, idx: number) => (
            <Table
              key={idx}
              name={table.name}
              type={table.type}
              time={table.time}
            />
          ))}
        </main>
      </div>
    </DefaultLayout>
  );
}
