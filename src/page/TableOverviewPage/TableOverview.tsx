import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';

export default function TableOverview() {
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
              토론주제
            </span>
          </div>
        </DefaultLayout.Header.Right>
      </DefaultLayout.Header>
      <DefaultLayout.ContentContanier>
        <PropsAndConsTitle />
        {/* {data.map((info) => (
          <DebatePanel key={info.time} info={info} />
        ))} */}
      </DefaultLayout.ContentContanier>
      <DefaultLayout.FixedFooterWrapper>
        <button className="h-20 w-screen bg-amber-300">버튼</button>
      </DefaultLayout.FixedFooterWrapper>
    </DefaultLayout>
  );
}
