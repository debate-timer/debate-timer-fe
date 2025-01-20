import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateTable } from '../../type/type';
import AddTable from './components/Table/AddTable';
import Table from './components/Table/Table';
import { useGetDebateTableList } from '../../hooks/query/useGetDebateTableList';
import { useDeleteParliamentaryDebateTable } from '../../hooks/mutations/useDeleteParliamentaryDebateTable';
import { getMemberIdToken } from '../../util/memberIdToken';

export default function TableListPage() {
  const { data: tables } = useGetDebateTableList(getMemberIdToken());

  const { mutate } = useDeleteParliamentaryDebateTable();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>테이블 목록화면</DefaultLayout.Header.Left>
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
                onDelete={() =>
                  mutate({ tableId: table.id, memberId: getMemberIdToken() })
                }
              />
            ))}
          <AddTable />
        </main>
      </div>
    </DefaultLayout>
  );
}
