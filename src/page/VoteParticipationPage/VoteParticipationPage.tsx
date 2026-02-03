import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import clsx from 'clsx';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import ClearableInput from '../../components/ClearableInput/ClearableInput';
import { useModal } from '../../hooks/useModal';
import DialogModal from '../../components/DialogModal/DialogModal';
import VoteTeamButton from './components/VoteTeamButton';
import { useGetVoterPollInfo } from '../../hooks/query/useGetVoterPollInfo';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import usePostVoterPollInfo from '../../hooks/mutations/usePostVoterPollInfo';
import { TeamKey } from '../../type/type';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

const TEAM_LABEL = {
  PROS: '찬성팀',
  CONS: '반대팀',
} as const;

export default function VoteParticipationPage() {
  const { t, i18n } = useTranslation();
  const { id: pollIdParam } = useParams();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  // 1) pollId 파싱 + 유효성 체크
  const pollId = pollIdParam ? Number(pollIdParam) : NaN;
  const isValidPollId = !!pollIdParam && !Number.isNaN(pollId);

  const [participantName, setParticipantName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<TeamKey | null>(null);

  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    isRefetching,
    refetch,
    isRefetchError,
  } = useGetVoterPollInfo(pollId, { enabled: isValidPollId });
  const { openModal, closeModal, ModalWrapper } = useModal();

  const isSubmitDisabled =
    participantName.trim().length === 0 || selectedTeam === null;

  const { mutate } = usePostVoterPollInfo(() =>
    navigate(buildLangPath('/vote/end', lang)),
  );

  const handleSubmit = () => {
    if (isSubmitDisabled) return;
    mutate({
      pollId: pollId,
      voterInfo: {
        name: participantName.trim(),
        participateCode: data?.participateCode ?? '',
        team: selectedTeam,
      },
    });
  };

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
          <ErrorIndicator onClickRetry={() => navigate(buildLangPath('/', lang))}>
            {t('유효하지 않은 투표 링크입니다.')}
          </ErrorIndicator>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }

  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer noPadding={true}>
        {isLoading && <LoadingIndicator />}
        {!isLoading && (
          <div className="sm:px-10  flex h-full w-full justify-center bg-default-white px-6 pb-8 pt-10">
            <div className="flex w-full  flex-1 flex-col items-center gap-10">
              <header className="mt-6 flex w-full flex-col items-center text-center">
                <h1 className="sm:text-4xl text-3xl font-bold text-default-black">
                  {t('승패투표')}
                </h1>
              </header>

              <section className="flex min-h-[500px] w-full flex-col items-center justify-center gap-8">
                <div className="flex w-full max-w-[480px] items-center gap-3 md:flex-row md:gap-4">
                  <label
                    htmlFor="participant-name"
                    className="sm:text-xl whitespace-nowrap text-lg font-semibold text-default-black"
                  >
                    {t('참여자 :')}
                  </label>
                  <ClearableInput
                    value={participantName}
                    onChange={(e) => setParticipantName(e.target.value)}
                    onClear={() => setParticipantName('')}
                  />
                </div>

                <div className="mt-10 flex w-full flex-col items-center gap-4 md:flex-row md:items-stretch md:justify-center md:gap-20">
                  <VoteTeamButton
                    label={TEAM_LABEL.PROS}
                    name={data?.prosTeamName ?? t('찬성팀')}
                    teamkey="PROS"
                    isSelected={selectedTeam === 'PROS'}
                    selectedTeam={selectedTeam}
                    onSelect={() => setSelectedTeam('PROS')}
                  />

                  <VoteTeamButton
                    label={TEAM_LABEL.CONS}
                    name={data?.consTeamName ?? t('반대팀')}
                    teamkey="CONS"
                    isSelected={selectedTeam === 'CONS'}
                    selectedTeam={selectedTeam}
                    onSelect={() => setSelectedTeam('CONS')}
                  />
                </div>
              </section>
            </div>
          </div>
        )}

        <DefaultLayout.StickyFooterWrapper>
          <button
            type="button"
            className={clsx(
              'button mb-8 w-full max-w-[400px] rounded-full',
              isSubmitDisabled
                ? 'disabled bg-default-disabled/hover'
                : 'enabled brand mb-8',
            )}
            onClick={openModal}
            disabled={isSubmitDisabled}
          >
            {t('투표완료')}
          </button>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout.ContentContainer>
      <ModalWrapper>
        <DialogModal
          left={{
            text: t('다시 투표하기'),
            onClick: () => closeModal(),
            isBold: true,
          }}
          right={{
            text: t('제출하기'),
            onClick: () => {
              handleSubmit();
              closeModal();
            },
            isBold: true,
          }}
        >
          <div className="flex flex-col items-center justify-center px-14 py-24 text-center">
            <h2 className="text-xl font-semibold">
              {t('투표를 제출하시겠습니까?')}
            </h2>
            <p className="text-bas mt-2">
              {t('(제출 후에는 변경이 불가능 합니다.)')}
            </p>
          </div>
        </DialogModal>
      </ModalWrapper>
    </DefaultLayout>
  );
}
