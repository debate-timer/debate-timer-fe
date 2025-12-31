import { useNavigate, useParams } from 'react-router-dom';

import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import WinnerCard from './components/WinnerCard';
import { useModal } from '../../hooks/useModal';
import VoteDetailResult from './components/VoteDetailResult';
import { useGetPollInfo } from '../../hooks/query/useGetPollInfo';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import { TeamKey } from '../../type/type';
import { useCallback, useEffect, useState } from 'react';
import DialogModal from '../../components/DialogModal/DialogModal';
export default function DebateVoteResultPage() {
  // 매개변수 검증
  const { pollId: rawPollId, tableId: rawTableId } = useParams();
  const pollId = rawPollId ? Number(rawPollId) : NaN;
  const isPollIdValid = !!rawPollId && !Number.isNaN(pollId);
  const tableId = rawTableId ? Number(rawTableId) : NaN;
  const isTableIdValid = !!rawTableId && !Number.isNaN(tableId);
  const isArgsValid = isPollIdValid && isTableIdValid;

  const [isConfirmed, setIsConfirmed] = useState(false);
  const navigate = useNavigate();

  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    isRefetching,
    refetch,
    isRefetchError,
  } = useGetPollInfo(pollId, { enabled: isArgsValid });
  const handleGoHome = () => {
    navigate('/');
  };
  const handleGoToEndPage = useCallback(() => {
    navigate(`/table/customize/${tableId}/end`, { replace: true });
  }, [navigate, tableId]);

  useEffect(() => {
    if (!isArgsValid) return;

    window.addEventListener('popstate', handleGoToEndPage);
    return () => window.removeEventListener('popstate', handleGoToEndPage);
  }, [handleGoToEndPage, isArgsValid]);

  const isLoading = isFetching || isRefetching;
  const isError = isFetchError || isRefetchError;
  const { openModal, ModalWrapper, closeModal } = useModal({
    onClose: () => setIsConfirmed(false),
  });

  const getWinner = (result: {
    prosTeamName: string;
    consTeamName: string;
    prosCount: number;
    consCount: number;
  }): { teamKey: TeamKey | null; teamName: string } => {
    const { prosTeamName, consTeamName, prosCount, consCount } = result;

    if (prosCount > consCount) {
      return {
        teamKey: 'PROS',
        teamName: prosTeamName,
      };
    } else if (consCount > prosCount) {
      return {
        teamKey: 'CONS',
        teamName: consTeamName,
      };
    } else {
      return {
        teamKey: null,
        teamName: '무승부',
      };
    }
  };

  if (!isArgsValid) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => navigate('/')}>
            유효하지 않은 투표 결과 링크입니다.
          </ErrorIndicator>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }
  if (isError) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => refetch()} />
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }
  const { teamKey, teamName } = getWinner({
    prosTeamName: data?.prosTeamName || '찬성팀',
    consTeamName: data?.consTeamName || '반대팀',
    prosCount: data?.prosCount || 0,
    consCount: data?.consCount || 0,
  });
  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer noPadding={true}>
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brandBackground px-6 py-10 ">
          <header className="flex w-full max-w-[1120px] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-default-black lg:text-4xl xl:text-display-raw">
              승패투표
            </h1>
          </header>

          <main className="m mt-10 flex w-full max-w-[1120px] flex-1 flex-col items-center justify-center gap-10 md:flex-row md:items-center md:justify-center">
            <WinnerCard teamkey={teamKey} teamName={teamName} />
          </main>

          <DefaultLayout.StickyFooterWrapper>
            <div className="flex w-full max-w-[400px] flex-col items-center justify-center gap-2 md:w-full md:max-w-[800px] md:flex-row">
              <button
                type="button"
                onClick={handleGoToEndPage}
                className="button enabled neutral flex w-full flex-1 rounded-full p-[24px]"
                disabled={isLoading}
              >
                토론 종료화면으로
              </button>
              <button
                type="button"
                onClick={openModal}
                className="button enabled brand flex w-full flex-1 rounded-full p-[24px]"
                disabled={isLoading}
              >
                세부 결과 확인하기
              </button>
            </div>
          </DefaultLayout.StickyFooterWrapper>
        </div>
      </DefaultLayout.ContentContainer>
      <ModalWrapper>
        {isConfirmed ? (
          <VoteDetailResult
            pros={{
              name: data?.prosTeamName ?? '찬성팀',
              count: data?.prosCount ?? 0,
            }}
            cons={{
              name: data?.consTeamName ?? '반대팀',
              count: data?.consCount ?? 0,
            }}
            onGoHome={handleGoHome}
          />
        ) : (
          <DialogModal
            left={{
              text: '아니오',
              onClick: () => closeModal(),
            }}
            right={{
              text: '네',
              onClick: () => setIsConfirmed(true),
              isBold: true,
            }}
          >
            <div className="break-keep px-20 py-10 text-center text-xl font-bold">
              정말로 세부 결과를 공개할까요?
            </div>
          </DialogModal>
        )}
      </ModalWrapper>
    </DefaultLayout>
  );
}
