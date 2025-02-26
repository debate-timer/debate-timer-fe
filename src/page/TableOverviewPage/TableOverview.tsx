import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useNavigate, useParams } from 'react-router-dom';
import DebatePanel from '../TableComposition/components/DebatePanel/DebatePanel';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
export default function TableOverview() {
  const pathParams = useParams();
  const tableId = Number(pathParams.id);
  const { data } = useGetParliamentaryTableData(tableId);

  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <HeaderTableInfo name={data?.info.name} type={'PARLIAMENTARY'} />
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <HeaderTitle title={data?.info.agenda} />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>
      <DefaultLayout.ContentContainer>
        <PropsAndConsTitle />
        {data &&
          data.table.map((info, index) => (
            <DebatePanel key={index} info={info} />
          ))}
      </DefaultLayout.ContentContainer>
      <DefaultLayout.StickyFooterWrapper>
        <button
          className="h-20 w-screen rounded-md bg-blue-300 text-2xl"
          onClick={() =>
            navigate(
              `/composition?mode=edit&tableId=${tableId}&type=PARLIAMENTARY`,
            )
          }
        >
          테이블 수정하기
        </button>
        <button
          className="h-20 w-screen rounded-md bg-red-300 text-2xl"
          onClick={() => navigate(`/table/parliamentary/${tableId}`)}
        >
          토론하기
        </button>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
