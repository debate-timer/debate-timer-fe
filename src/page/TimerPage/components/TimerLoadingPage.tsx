import DefaultLayout from '../../../layout/defaultLayout/DefaultLayout';

export default function TimerLoadingPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center px-2 text-2xl font-bold md:text-3xl">
            <div className="h-8 w-[240px] rounded-2xl bg-zinc-100 px-4">
              <h1 className="text-xl text-zinc-400">...</h1>
            </div>
            <div className="mx-3 h-6 w-[2px] bg-black"></div>
            <span className="text-lg font-normal md:text-xl">의회식</span>
          </div>
        </DefaultLayout.Header.Left>
        <DefaultLayout.Header.Right>
          <div className="flex flex-row items-center space-x-3 md:w-auto md:gap-3">
            <h1 className="text-lg md:text-xl">토론 주제</h1>
            <div className="h-8 w-[240px] rounded-2xl bg-zinc-100 px-4">
              <h1 className="text-xl text-zinc-400">...</h1>
            </div>
          </div>
        </DefaultLayout.Header.Right>
      </DefaultLayout.Header>

      <DefaultLayout.ContentContanier>
        <div className="flex h-full w-full flex-col items-center justify-center space-y-5">
          <img src="/spinner.gif" className="size-[120px]" alt="불러오는 중" />
          <h1 className="text-xl font-bold">데이터를 불러오고 있습니다...</h1>
        </div>
      </DefaultLayout.ContentContanier>
    </DefaultLayout>
  );
}
