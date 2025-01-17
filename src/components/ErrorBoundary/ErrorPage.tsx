import { IoRefresh } from 'react-icons/io5';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';

interface ErrorPageProps {
  message: string;
  stack: string;
}

export default function ErrorPage({ message, stack }: ErrorPageProps) {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left>
          <div className="flex flex-wrap items-center px-2 text-2xl font-bold md:text-3xl">
            <h1 className="mr-2">오류 발생</h1>
          </div>
        </DefaultLayout.Header.Left>
      </DefaultLayout.Header>

      <DefaultLayout.ContentContanier>
        <div className="flex w-full flex-col items-start justify-start px-8 py-20">
          <div className="mb-20 flex flex-col">
            <h1 className="text-4xl font-bold md:text-5xl">
              오류가 발생했어요... 😭
            </h1>
          </div>

          <div className="mb-10 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">오류 내용</h1>
            <p className="text-lg">{message}</p>
          </div>

          <div className="mb-20 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">스택</h1>
            <p className="text-lg">{stack}</p>
          </div>

          <button
            className="rounded-full bg-zinc-300 px-8 py-4 hover:bg-zinc-400"
            type="button"
            onClick={() => window.location.reload()}
          >
            <div className="flex flex-row items-center justify-center space-x-4">
              <IoRefresh size={30} />
              <h1 className="mt-0.5 text-2xl font-bold">다시 시도해보기</h1>
            </div>
          </button>
        </div>
      </DefaultLayout.ContentContanier>
    </DefaultLayout>
  );
}
