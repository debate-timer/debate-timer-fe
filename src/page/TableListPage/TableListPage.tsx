import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import AddTable from './components/AddTable';
import Table from './components/Table';

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
