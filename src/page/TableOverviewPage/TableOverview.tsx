import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useNavigate, useParams } from 'react-router-dom';
import DebatePanel from '../TableComposition/components/DebatePanel/DebatePanel';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { RiEditFill, RiSpeakFill } from 'react-icons/ri';
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
        <section className="mx-auto flex w-full max-w-4xl flex-col justify-center">
          <PropsAndConsTitle />
          <div className="flex w-full flex-col gap-2">
            {data &&
              data.table.map((info, index) => (
                <DebatePanel key={index} info={info} />
              ))}
          </div>
        </section>
      </DefaultLayout.ContentContainer>

      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-4 flex w-full max-w-4xl items-center justify-between gap-2">
          <button
            className="button enabled h-16 w-full"
            onClick={() =>
              navigate(
                `/composition?mode=edit&tableId=${tableId}&type=PARLIAMENTARY`,
              )
            }
          >
            <div className="flex items-center justify-center gap-2">
              <RiEditFill />
              수정하기
            </div>
          </button>
          <button
            className="button enabled h-16 w-full"
            onClick={() => navigate(`/table/parliamentary/${tableId}`)}
          >
            <div className="flex items-center justify-center gap-2">
              <RiSpeakFill />
              토론하기
            </div>
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
