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
      <DefaultLayout.ContentContanier>
        <section className="mx-auto flex w-full max-w-4xl flex-col">
          <PropsAndConsTitle />
          {data &&
            data.table.map((info, index) => (
              <DebatePanel key={index} info={info} />
            ))}
        </section>
      </DefaultLayout.ContentContanier>
      <DefaultLayout.StickyFooterWrapper>
        <div className="mx-auto mb-4 flex w-full max-w-4xl gap-1 px-6 md:px-8">
          <button
            className="flex h-16 w-screen items-center justify-center gap-2 rounded-md  bg-neutral-300 text-2xl"
            onClick={() =>
              navigate(
                `/composition?mode=edit&tableId=${tableId}&type=PARLIAMENTARY`,
              )
            }
          >
            <RiEditFill />
            수정하기
          </button>
          <button
            className="flex h-16 w-screen items-center justify-center gap-2 rounded-md bg-brand-main text-2xl"
            onClick={() => navigate(`/table/parliamentary/${tableId}`)}
          >
            <RiSpeakFill />
            토론하기
          </button>
        </div>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
