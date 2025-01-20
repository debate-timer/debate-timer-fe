import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DebatePanel from '../TableComposition/components/DebatePanel/DebatePanel';
import { getMemberIdToken } from '../../util/memberIdToken';

export default function TableOverview() {
  const [searchParams] = useSearchParams();
  const tableId = Number(searchParams.get('tableId') || 0);
  const { data } = useGetParliamentaryTableData(tableId, getMemberIdToken());

  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center px-2 text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">테이블 1</h1>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>

        <DefaultLayout.Header.Right>
          <div className="flex flex-wrap items-center gap-2 px-2 md:w-auto md:gap-3">
            <span className="text-sm md:text-base">토론 주제</span>
            <span className="w-full rounded-md bg-slate-100 p-2 text-base md:w-[30rem] md:text-2xl">
              {data?.info.agenda}
            </span>
          </div>
        </DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <DefaultLayout.ContentContanier>
        <PropsAndConsTitle />
        {data &&
          data.table.map((info, index) => (
            <DebatePanel key={index} info={info} />
          ))}
      </DefaultLayout.ContentContanier>
      <DefaultLayout.StickyFooterWrapper>
        <button
          className="h-20 w-screen rounded-md bg-blue-300 text-2xl"
          onClick={() =>
            navigate(
              `/composition?mode=edit&tableId=${data?.id}&type=PARLIAMENTARY`,
            )
          }
        >
          테이블 수정하기
        </button>
        <button
          className="h-20 w-screen rounded-md bg-red-300 text-2xl"
          onClick={() =>
            navigate(
              `/table/parliamentary/${data?.id}?memberId=${getMemberIdToken()}`,
            )
          }
        >
          토론하기
        </button>
      </DefaultLayout.StickyFooterWrapper>
    </DefaultLayout>
  );
}
