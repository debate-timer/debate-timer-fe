import { useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateTable } from '../../type/type';
import AddTable from './components/Table/AddTable';
import Table from './components/Table/Table';

const initialData = [
  { name: '테이블1', type: '의회식 토론', time: 30, onDelete: () => {} },
  { name: '테이블 2', type: '의회식 토론', time: 30, onDelete: () => {} },
  { name: '테이블 3', type: '의회식 토론', time: 30, onDelete: () => {} },
  { name: '테이블 4', type: '의회식 토론', time: 30, onDelete: () => {} },
];

export default function TableListPage() {
  const [tables, setTables] = useState<DebateTable[]>(initialData);

  const handleDelete = (targetName: string) => {
    setTables(tables.filter((table) => table.name !== targetName));
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>테이블 목록화면</DefaultLayout.Header.Left>
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col px-4 py-6">
        <main className="grid grid-cols-3 justify-items-center gap-6">
          {tables.map((table: DebateTable, idx: number) => (
            <Table
              key={idx}
              name={table.name}
              type={table.type}
              time={table.time}
              onDelete={handleDelete}
            />
          ))}
          <AddTable />
        </main>
      </div>
    </DefaultLayout>
  );
}
