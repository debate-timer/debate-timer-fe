import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useGetPollInfo } from '../../hooks/query/useGetPollInfo';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import useFetchEndpoll from '../../hooks/mutations/useFetchEndpoll';
export default function DebateVotePage() {
  const { id: pollIdParam } = useParams();
  const pollId = pollIdParam ? Number(pollIdParam) : NaN;
  const isValidPollId = !!pollIdParam && !Number.isNaN(pollId);
  const navigate = useNavigate();
  const baseUrl =
    import.meta.env.MODE !== 'production'
      ? undefined
      : import.meta.env.VITE_SHARE_BASE_URL;
  const voteUrl = useMemo(() => {
    return `${baseUrl}/vote/${pollId}`;
  }, [baseUrl, pollId]);

  const handleGoToResult = () => {
    navigate(`/table/customize/${pollId}/end/vote/result`);
  };

  const handleGoHome = () => {
    navigate('/');
  };
  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    isRefetching,
    refetch,
    isRefetchError,
  } = useGetPollInfo(pollId, { refetchInterval: 5000, enabled: isValidPollId });
  const { mutate } = useFetchEndpoll(handleGoToResult);

  const participants = data?.voterNames;
  const isLoading = isFetching || isRefetching;
  const isError = isFetchError || isRefetchError;

  if (isError) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => refetch()} />
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }
  if (!isValidPollId) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => navigate('/')}>
            유효하지 않은 투표 링크입니다.
          </ErrorIndicator>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }
  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer noPadding={true}>
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brandBackground px-6 py-10 ">
          <header className="flex w-full max-w-[1120px] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-default-black lg:text-4xl xl:text-display-raw">
              승패투표
            </h1>
          </header>

          <main className="mt-6 flex w-full max-w-[1120px] flex-1 flex-col items-center justify-start gap-10 md:mt-0 md:flex-row md:items-center md:justify-center">
            <section className="flex flex-col items-center gap-2">
              <p className="text-lg ">스캔해 주세요!</p>
              <div className="flex w-full flex-col items-center gap-6 rounded-[36px] border-[4px] border-brand bg-default-white p-2 ">
                <div className="flex items-center justify-center rounded-[32px] p-6 md:w-[350px]">
                  <QRCodeSVG value={voteUrl} className="h-full w-full" />
                </div>
              </div>
            </section>
            <section className="flex h-[200px] min-w-[250px] flex-col rounded-[36px] md:h-[400px] ">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-semibold text-default-black lg:text-2xl">
                  참여자
                  <span className="ml-2 text-brand">
                    ({participants?.length ?? 0})
                  </span>
                </h2>
              </div>
              <div className="mt-4 flex justify-center overflow-y-auto ">
                {!isLoading && participants && participants.length === 0 && (
                  <p className="text-default-weak">등록된 토론자가 없어요.</p>
                )}
                {!isLoading && participants && participants.length > 0 && (
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

          <DefaultLayout.StickyFooterWrapper>
            <div className="flex w-full max-w-[800px] flex-row items-center justify-center gap-2 bg-default-white">
              <button
                type="button"
                onClick={() => mutate(pollId)}
                className="button enabled brand w-full rounded-full"
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
            </div>
          </DefaultLayout.StickyFooterWrapper>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
