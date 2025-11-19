import { useNavigate, useParams } from 'react-router-dom';

import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import WinnerCard from './components/WinnerCard';
import { useModal } from '../../hooks/useModal';
import VoteDetailResult from './components/VoteDetailResult';
import { useGetPollInfo } from '../../hooks/query/useGetPollInfo';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import { TeamKey } from '../../type/type';
export default function DebateVoteResultPage() {
  const { pollId: pollIdParam } = useParams();

  const pollId = pollIdParam ? Number(pollIdParam) : NaN;
  const isValidPollId = !!pollIdParam && !Number.isNaN(pollId);
  const navigate = useNavigate();

  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    isRefetching,
    refetch,
    isRefetchError,
  } = useGetPollInfo(pollId, { enabled: isValidPollId });
  const handleGoHome = () => {
    navigate('/');
  };
  const isLoading = isFetching || isRefetching;
  const isError = isFetchError || isRefetchError;
  const { openModal, ModalWrapper } = useModal();

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

  if (!isValidPollId) {
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
            <div className="flex w-full max-w-[400px] flex-col items-center justify-center gap-2 bg-default-white md:max-w-[800px] md:flex-row">
              <button
                type="button"
                onClick={openModal}
                className="button enabled brand w-full rounded-full"
                disabled={isLoading}
              >
                세부 결과 확인하기
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
      <ModalWrapper>
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
      </ModalWrapper>
    </DefaultLayout>
  );
}
