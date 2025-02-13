import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useNavigate, useParams } from 'react-router-dom';
import DebatePanel from '../TableComposition/components/DebatePanel/DebatePanel';
import { IoMdHome } from 'react-icons/io';
import useLogout from '../../hooks/mutations/useLogout';

export default function TableOverview() {
  const pathParams = useParams();
  const tableId = Number(pathParams.id);
  const { data } = useGetParliamentaryTableData(tableId);
  const { mutate: logoutMutate } = useLogout(() => navigate('/login'));

  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">
              {data === undefined || data!.info.name.trim() === ''
                ? '테이블 이름 없음'
                : data!.info.name}
            </h1>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center>
          <div className="flex flex-col items-center">
            <h1 className="text-m md:text-lg">토론 주제</h1>
            <h1 className="max-w-md truncate text-xl font-bold md:text-2xl">
              {data === undefined || data!.info.agenda.trim() === ''
                ? '주제 없음'
                : data!.info.agenda}
            </h1>
          </div>
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right>
          <button
            onClick={() => {
              navigate('/');
            }}
            className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
          >
            <div className="flex flex-row items-center space-x-4">
              <IoMdHome size={24} />
              <h1>홈 화면</h1>
            </div>
          </button>
          <button
            onClick={() => logoutMutate()}
            className="rounded-full bg-slate-300 px-2 py-1 font-bold text-zinc-900 hover:bg-zinc-400"
          >
            <div className="flex flex-row items-center space-x-4">
              <h2>로그아웃</h2>
            </div>
          </button>
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
