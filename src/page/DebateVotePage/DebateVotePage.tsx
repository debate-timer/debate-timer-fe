import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import { useGetPollInfo } from '../../hooks/query/useGetPollInfo';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import useFetchEndPoll from '../../hooks/mutations/useFetchEndPoll';
import { useModal } from '../../hooks/useModal';
import DialogModal from '../../components/DialogModal/DialogModal';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';

export default function DebateVotePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
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
    navigate(
      buildLangPath(
        `/table/customize/${tableId}/end/vote/${pollId}/result`,
        lang,
      ),
    );
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
    mutate(pollId, {
      onSuccess: () => {
        closeModal();
      },
      onError: () => {
        closeModal();
        alert(t('투표 종료에 실패했습니다.'));
      },
    });
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
        <div className="flex min-h-screen w-full flex-col items-center justify-center bg-brandBackground px-6 py-10 ">
          <header className="flex w-full max-w-[1120px] flex-col items-center gap-2 text-center">
            <h1 className="text-3xl font-bold text-default-black lg:text-4xl xl:text-display-raw">
              {t('승패투표')}
            </h1>
          </header>

          <main className="mt-6 flex w-full max-w-[1120px] flex-1 flex-col items-center justify-start gap-10 md:mt-0 md:flex-row md:items-center md:justify-center">
            <section className="flex flex-col items-center gap-2">
              <p className="text-lg ">{t('스캔해 주세요!')}</p>
              <div className="flex w-full flex-col items-center gap-6 rounded-[36px] border-[4px] border-brand bg-default-white p-2 ">
                <div className="flex items-center justify-center rounded-[32px] p-6 md:w-[350px]">
                  <QRCodeSVG value={voteUrl} className="h-full w-full" />
                </div>
              </div>
            </section>
            <section className="flex h-[200px] min-w-[250px] flex-col rounded-[36px] md:h-[400px] ">
              <div className="flex items-center justify-center">
                <h2 className="text-xl font-semibold text-default-black lg:text-2xl">
                  {t('참여자')}

                  <span className="ml-2 text-brand">
                    ({participants?.length ?? 0})
                  </span>
                </h2>
              </div>
              <div className="mt-4 flex justify-center overflow-y-auto ">
                {!isLoading && participants && participants.length === 0 && (
                  <p className="text-default-weak">
                    {t('등록된 토론자가 없어요.')}
                  </p>
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
            <div className="flex w-full max-w-[400px] flex-row items-center justify-center gap-2">
              <button
                type="button"
                onClick={openModal}
                className="button enabled brand flex flex-1 flex-row rounded-full p-[24px]"
              >
                {t('투표 결과 보기')}
              </button>
            </div>
          </DefaultLayout.StickyFooterWrapper>
        </div>
      </DefaultLayout.ContentContainer>
      <ModalWrapper>
        <DialogModal
          right={{
            text: t('마감하기'),
            onClick: handleConfirmEnd,
            isBold: true,
          }}
        >
          <div className="px-16 py-24 text-center text-black">
            <p className="text-xl font-semibold">
              {t('투표를 마감하시겠습니까?')}
            </p>
            <p className="mt-2 text-sm text-default-neutral">
              {t('투표를 마감하면 더이상 표를 받을 수 없습니다!')}
            </p>
          </div>
        </DialogModal>
      </ModalWrapper>
    </DefaultLayout>
  );
}
