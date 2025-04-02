import { useNavigate } from 'react-router-dom';
import { useDeleteParliamentaryDebateTable } from '../../hooks/mutations/useDeleteParliamentaryDebateTable';
import { useGetDebateTableList } from '../../hooks/query/useGetDebateTableList';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { DebateTable, DebateType } from '../../type/type';
import Table from './components/Table';

export default function TableListPage() {
  const { data } = useGetDebateTableList();
  console.log(data);
  const { mutate } = useDeleteParliamentaryDebateTable();
  const navigate = useNavigate();
  const onEdit = (tableId: number, type: DebateType) => {
    navigate(`/composition?mode=edit&tableId=${tableId}&type=${type}`);
  };
  const onClick = (tableId: number) => {
    navigate(`/overview/${tableId}`);
  };

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left></DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <div className="flex flex-wrap items-center justify-center px-2 text-2xl font-bold md:text-3xl">
            <h1>토론 시간표를 선택해주세요</h1>
          </div>
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <div className="flex max-w-[1140px] flex-wrap justify-start">
          {/** Button that adds new table */}
          <button
            onClick={() => navigate(`/composition?mode=add`)}
            className="m-5 h-[220px] w-[340px] rounded-[28px] bg-neutral-200 shadow-lg duration-200 hover:scale-105"
          >
            <h1 className="text-[100px] font-light text-neutral-500">+</h1>
          </button>

          {/** All tables */}
          {data &&
            data.tables.map((table: DebateTable, idx: number) => (
              <Table
                key={idx}
                id={table.id}
                name={table.name}
                type={table.type}
                agenda={table.agenda}
                onDelete={() => mutate({ tableId: table.id })}
                onEdit={() => onEdit(table.id, table.type)}
                onClick={() => onClick(table.id)}
              />
            ))}
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
