import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useGetPollInfo } from '../../hooks/query/useGetPollInfo';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import useFetchEndPoll from '../../hooks/mutations/useFetchEndPoll';
import GoToDebateEndButton from '../../components/GoToDebateEndButton/GoToDebateEndButton';
import { useModal } from '../../hooks/useModal';
import DialogModal from '../../components/DialogModal/DialogModal';
export default function DebateVotePage() {
  const navigate = useNavigate();
  const baseUrl =
    import.meta.env.MODE !== 'production'
      ? undefined
      : import.meta.env.VITE_SHARE_BASE_URL;

  // 매개변수 검증
  const { pollId: rawPollId, tableId: rawTableId } = useParams();
  const pollId = rawPollId ? Number(rawPollId) : NaN;
  const isPollIdValid = !!rawPollId && !Number.isNaN(pollId);
  const tableId = rawTableId ? Number(rawTableId) : NaN;
  const isTableIdValid = !!rawTableId && !Number.isNaN(tableId);
  const isArgsValid = isPollIdValid && isTableIdValid;

  const voteUrl = useMemo(() => {
    return `${baseUrl}/vote/${pollId}`;
  }, [baseUrl, pollId]);

  const handleGoToResult = () => {
    navigate(`/table/customize/${tableId}/end/vote/${pollId}/result`);
  };

  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    isRefetching,
    refetch,
    isRefetchError,
  } = useGetPollInfo(pollId, { refetchInterval: 5000, enabled: isArgsValid });
  const { openModal, closeModal, ModalWrapper } = useModal();
  const { mutate } = useFetchEndPoll(handleGoToResult);
  const handleConfirmEnd = () => {
    if (!isArgsValid) return;
    mutate(pollId);
    closeModal();
  };

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

  if (!isArgsValid) {
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
            <div className="flex w-full max-w-[800px] flex-row items-center justify-center gap-2">
              <GoToDebateEndButton tableId={tableId} className="flex-1" />
              <button
                type="button"
                onClick={openModal}
                className="button enabled brand flex flex-1 flex-row rounded-full p-[24px]"
              >
                투표 결과 보기
              </button>
            </div>
          </DefaultLayout.StickyFooterWrapper>
        </div>
      </DefaultLayout.ContentContainer>
      <ModalWrapper>
        <DialogModal
          right={{
            text: '종료하기',
            onClick: handleConfirmEnd,
            isBold: true,
          }}
        >
          <div className="text-neutral-1000 p-20 text-center text-lg font-semibold">
            정말로 종료하시겠습니까?
          </div>
        </DialogModal>
      </ModalWrapper>
    </DefaultLayout>
  );
}
