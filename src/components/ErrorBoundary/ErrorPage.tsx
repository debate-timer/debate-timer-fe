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
        <div className="flex w-full flex-col justify-start px-8 py-20">
          <div className="mb-20 flex flex-col">
            <h1 className="text-4xl font-bold md:text-5xl">
              오류가 발생했어요... 😭
            </h1>
          </div>

          <div className="mb-10 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">오류 내용</h1>
            <p className="text-lg">{message}</p>
          </div>

          <div className="mb-10 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">스택</h1>
            <p className="text-lg">{stack}</p>
          </div>
        </div>
      </DefaultLayout.ContentContanier>
    </DefaultLayout>
  );
}
