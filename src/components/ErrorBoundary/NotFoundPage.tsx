import { useNavigate } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { IoHome } from 'react-icons/io5';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left></DefaultLayout.Header.Left>
        <DefaultLayout.Header.Center></DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right defaultIcons={['home', 'logout']} />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <div className="flex w-full flex-col items-start justify-start px-8 py-10">
          <div className="mb-20 flex flex-col font-bold">
            <h1 className="mb-5 text-[120px]">🤔</h1>
            <h1 className="text-4xl md:text-5xl">페이지를 찾을 수 없어요...</h1>
          </div>

          <div className="mb-10 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">요청 URL</h1>
            <p className="text-lg">
              {decodeURIComponent(window.location.href)}
            </p>
          </div>

          <div className="mb-20 flex flex-col space-y-2">
            <h1 className="text-xl font-bold">오류 내용</h1>
            <p className="text-lg">
              요청하신 페이지를 찾을 수 없어요. 홈 화면으로 돌아가 처음부터 다시
              시도해주세요.
            </p>
          </div>

          <button
            className="rounded-full bg-zinc-300 px-8 py-4 hover:bg-zinc-400"
            type="button"
            onClick={() => navigate('/')}
          >
            <div className="flex flex-row items-center justify-center space-x-4">
              <IoHome size={30} />
              <h1 className="mt-0.5 text-2xl font-semibold">홈으로 돌아가기</h1>
            </div>
          </button>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
