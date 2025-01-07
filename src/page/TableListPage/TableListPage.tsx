import { useState } from 'react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateTable } from '../../type/type';
import AddTable from './components/Table/AddTable';
import Table from './components/Table/Table';

const initialData: DebateTableWithDelete[] = [
  {
    id: 0,
    name: '테이블 1',
    type: '의회식 토론',
    duration: 30,
    onDelete: () => {},
  },
  {
    id: 1,
    name: '테이블 2',
    type: '의회식 토론',
    duration: 30,
    onDelete: () => {},
  },
  {
    id: 2,
    name: '테이블 3',
    type: '의회식 토론',
    duration: 30,
    onDelete: () => {},
  },
  {
    id: 3,
    name: '테이블 4',
    type: '의회식 토론',
    duration: 30,
    onDelete: () => {},
  },
];

interface DebateTableWithDelete extends DebateTable {
  onDelete: (name: string) => void;
}

export default function TableListPage() {
  const [tables, setTables] = useState<DebateTableWithDelete[]>(initialData);

  const handleDelete = (targetName: string) => {
    setTables((prevTables) =>
      prevTables.filter((table) => table.name !== targetName),
    );
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>테이블 목록화면</DefaultLayout.Header.Left>
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col px-4 py-6">
        <main className="grid grid-cols-3 justify-items-center gap-6">
          {tables.map((table: DebateTableWithDelete, idx: number) => (
            <Table
              key={idx}
              id={table.id}
              name={table.name}
              type={table.type}
              duration={table.duration}
              onDelete={handleDelete}
            />
          ))}
          <AddTable />
        </main>
      </div>
    </DefaultLayout>
  );
}
