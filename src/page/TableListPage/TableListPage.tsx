import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { TableProps } from '../../type/type';
import AddTable from './components/AddTable';
import Table from './components/Table';

const data = [
  { name: '테이블1', type: '의회식 토론', time: 30 },
  { name: '테이블 2', type: '의회식 토론', time: 30 },
  { name: '테이블 3', type: '의회식 토론', time: 30 },
  { name: '테이블 4', type: '의회식 토론', time: 30 },
];

export default function TableListPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>테이블 목록화면</DefaultLayout.Header.Left>
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col px-4 py-6">
        <main className="grid grid-cols-3 justify-items-center gap-6">
          {data.map((table: TableProps, idx: number) => (
            <Table
              key={idx}
              name={table.name}
              type={table.type}
              time={table.time}
            />
          ))}
          <AddTable />
        </main>
      </div>
    </DefaultLayout>
  );
}
