import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateTable } from '../../type/type';
import AddTable from './components/Table/AddTable';
import Table from './components/Table/Table';
import { useGetDebateTableList } from '../../hooks/query/useGetDebateTableList';
import { useDeleteParliamentaryDebateTable } from '../../hooks/mutations/useDeleteParliamentaryDebateTable';

export default function TableListPage() {
  const { data } = useGetDebateTableList();
  const { mutate } = useDeleteParliamentaryDebateTable();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left></DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <div className="flex flex-wrap items-center justify-center px-2 text-2xl font-bold md:text-3xl">
            <h1>토론 시간표를 선택해주세요.</h1>
          </div>
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <div className="flex flex-wrap px-20 py-6">
          {data &&
            data.tables.map((table: DebateTable, idx: number) => (
              <Table
                key={idx}
                id={table.id}
                name={table.name}
                type={table.type}
                agenda={table.agenda}
                onDelete={() => mutate({ tableId: table.id })}
              />
            ))}
          <AddTable />
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
