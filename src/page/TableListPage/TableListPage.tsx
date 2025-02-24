import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateTable } from '../../type/type';
import AddTable from './components/Table/AddTable';
import Table from './components/Table/Table';
import { useGetDebateTableList } from '../../hooks/query/useGetDebateTableList';
import { useDeleteParliamentaryDebateTable } from '../../hooks/mutations/useDeleteParliamentaryDebateTable';

export default function TableListPage() {
  const { data: tables } = useGetDebateTableList();

  const { mutate } = useDeleteParliamentaryDebateTable();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">테이블 목록</h1>
          </div>
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center />
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>
      <div className="flex h-screen flex-col px-4 py-6">
        <main className="grid grid-cols-3 justify-items-center gap-6">
          {tables &&
            tables.tables.map((table: DebateTable, idx: number) => (
              <Table
                key={idx}
                id={table.id}
                name={table.name}
                type={table.type}
                duration={table.duration}
                onDelete={() => mutate({ tableId: table.id })}
              />
            ))}
          <AddTable />
        </main>
      </div>
    </DefaultLayout>
  );
}
