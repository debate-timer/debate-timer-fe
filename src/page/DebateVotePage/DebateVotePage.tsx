import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

import LoadingSpinner from '../../components/LoadingSpinner';

import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
const backgroundStyle = {
  background:
    'radial-gradient(80% 80% at 50% 50%, #fecd4c21 0%, #ffffff42 100%)',
};

export default function DebateVotePage() {
  const { id: tableIdParam } = useParams();
  const tableId = Number(tableIdParam);
  const navigate = useNavigate();

  const defaultBaseUrl =
    typeof window !== 'undefined' ? window.location.origin : '';
  const voteBaseUrl =
    (import.meta.env.VITE_VOTE_BASE_URL as string | undefined) ??
    defaultBaseUrl;
  const voteUrl = useMemo(() => {
    if (!tableId || Number.isNaN(tableId)) return defaultBaseUrl;
    return `${voteBaseUrl}/vote/${tableId}`;
  }, [tableId, voteBaseUrl, defaultBaseUrl]);

  const handleGoToResult = () => {
    if (!tableId || Number.isNaN(tableId)) return;
    navigate(`/table/customize/${tableId}/end/vote/result`);
  };
  const participants = [
    '김토론',
    '이찬토론',
    '박토론',
    '최토론',
    '정토론',
    '김토론',
    '이찬토론',
    '박토론',
    '최토론',
    '정토론',
    '최토론',
    '정토론',
    '김토론',
    '이찬토론',
    '박토론',
    '최토론',
    '정토론',
  ];

  const handleGoHome = () => {
    navigate('/');
  };
  const isLoading = tableId === undefined || Number.isNaN(tableId);

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer noPadding={true}>
        <div
          style={backgroundStyle}
          className="flex min-h-screen w-full flex-col items-center px-6 py-10"
        >
          <header className="flex w-full max-w-[1120px] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-default-black lg:text-4xl xl:text-display-raw">
              승패투표
            </h1>
          </header>

          <main className="mt-10 flex w-full max-w-[1120px] flex-1 flex-col items-center justify-start gap-10 md:mt-16 md:flex-row md:justify-center">
            <section className="flex flex-col items-center gap-2">
              <p className="text-lg ">스캔해 주세요!</p>
              <div className="flex w-full flex-col items-center gap-6 rounded-[36px] border-[4px] border-brand bg-default-white p-2 ">
                <div className="flex items-center justify-center rounded-[32px] p-6 md:w-[350px]">
                  {isLoading ? (
                    <LoadingSpinner
                      size="size-20"
                      color="text-default-disabled/hover"
                    />
                  ) : (
                    <QRCodeSVG value={voteUrl} className="h-full w-full" />
                  )}
                </div>
              </div>
            </section>

            {/* <section className="flex h-[400px] min-w-[350px] flex-col rounded-[36px] bg-default-white p-6 shadow-[0px_12px_30px_rgba(0,0,0,0.08)]">
              <div className="flex  items-center">
                <h2 className="text-xl font-semibold text-default-black lg:text-2xl">
                  참여자
                  <span className="ml-2 text-brand">
                    ({participants.length})
                  </span>
                </h2>
              </div>
              <div className="mt-4 overflow-y-auto">
                {isLoading && (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner
                      size="size-12"
                      color="text-default-disabled/hover"
                    />
                  </div>
                )}
                {!isLoading && participants.length === 0 && (
                  <p className="text-default-weak">등록된 토론자가 없어요.</p>
                )}
                {!isLoading && participants.length > 0 && (
                  <ul className="space-y-2">
                    {participants.map((name) => (
                      <li
                        key={name}
                        className="whitespace-nowrap text-xl text-default-black"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section> */}
            <section className="flex h-[400px] min-w-[350px] flex-col rounded-[36px] ">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-semibold text-default-black lg:text-2xl">
                  참여자
                  <span className="ml-2 text-brand">
                    ({participants.length})
                  </span>
                </h2>
              </div>
              <div className="mt-4 flex justify-center overflow-y-auto ">
                {isLoading && (
                  <div className="flex h-full items-center justify-center">
                    <LoadingSpinner
                      size="size-12"
                      color="text-default-disabled/hover"
                    />
                  </div>
                )}
                {!isLoading && participants.length === 0 && (
                  <p className="text-default-weak">등록된 토론자가 없어요.</p>
                )}
                {!isLoading && participants.length > 0 && (
                  <ul className="space-y-2">
                    {participants.map((name) => (
                      <li
                        key={name}
                        className="whitespace-nowrap text-xl text-default-black"
                      >
                        {name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          </main>

          <footer className="sm:flex-row mt-10 flex w-full max-w-[640px] flex-col gap-4 pb-6">
            <button
              type="button"
              onClick={handleGoToResult}
              className="button enabled brand w-full rounded-full"
              disabled={tableId === undefined || Number.isNaN(tableId)}
            >
              투표 결과 보기
            </button>
            <button
              type="button"
              onClick={handleGoHome}
              className="button enabled neutral w-full rounded-full"
            >
              홈으로 돌아가기 →
            </button>
          </footer>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
