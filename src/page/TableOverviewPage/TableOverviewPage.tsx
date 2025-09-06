import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import usePatchDebateTable from '../../hooks/mutations/usePatchDebateTable';
import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import TimeBox from '../TableComposition/components/TimeBox/TimeBox';
import { useTableShare } from '../../hooks/useTableShare';
import { CoinState, StanceToString } from '../../type/type';
import { isGuestFlow } from '../../util/sessionStorage';
import DTShare from '../../components/icons/Share';
import DTDebate from '../../components/icons/Debate';
import DTEdit from '../../components/icons/Edit';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import Coins from '../../assets/teamSelection/coins.png';
import TeamSelectionModal from './components/TeamSelectionModal/TeamSelectionModal';
import { useModal } from '../../hooks/useModal';
import clsx from 'clsx';
import { useState, useCallback } from 'react';

export default function TableOverviewPage() {
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();
  const { openModal, closeModal, ModalWrapper } = useModal();
  const [modalCoinState, setModalCoinState] = useState<CoinState>('initial');

  const handleOpenModal = () => {
    setModalCoinState('initial');
    openModal();
  };

  const handleCoinStateChange = useCallback((newState: CoinState) => {
    setModalCoinState(newState);
  }, []);

  // Only uses hooks related with customize due to the removal of parliamentary
  const {
    data,
    isLoading: isFetching,
    isError: isFetchError,
    refetch,
    isRefetching,
    isRefetchError,
  } = useGetDebateTableData(tableId);
  const onModifyCustomizeTableData = usePatchDebateTable((tableId) => {
    navigate(`/table/customize/${tableId}`);
  });

  // Hook for sharing tables
  const { openShareModal, TableShareModal } = useTableShare(tableId);
  const isLoading = isFetching || isRefetching;
  const isError = isFetchError || isRefetchError;

  // 토론 시작하기 핸들러
  const handleStartDebate = () => {
    if (isGuestFlow()) {
      navigate('/table/customize/guest');
    } else {
      onModifyCustomizeTableData.mutate({ tableId });
    }
  };

  // 토론 수정하기 핸들러
  const handleEdit = () => {
    if (isGuestFlow()) {
      navigate(`/composition?mode=edit&type=CUSTOMIZE`, {
        state: { step: 'NameAndType' },
      });
    } else {
      navigate(`/composition?mode=edit&tableId=${tableId}&type=CUSTOMIZE`, {
        state: { step: 'NameAndType' },
      });
    }
  };

  if (isError) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => refetch()} />
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }

  return (
    <>
      <DefaultLayout>
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            {!isLoading && <HeaderTableInfo name={data?.info.name} />}
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            {!isLoading && <HeaderTitle title={data?.info.agenda} />}
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right />
        </DefaultLayout.Header>

        <DefaultLayout.ContentContainer>
          {isLoading && <LoadingIndicator />}
          {!isLoading && (
            <section className="mx-auto flex w-full max-w-4xl flex-col justify-center">
              <PropsAndConsTitle
                prosTeamName={
                  data !== undefined
                    ? data.info.prosTeamName
                    : StanceToString['PROS']
                }
                consTeamName={
                  data !== undefined
                    ? data.info.consTeamName
                    : StanceToString['CONS']
                }
              />

              <div className="flex w-full flex-col gap-2">
                {data?.table.map((info, index) => (
                  <TimeBox
                    key={index}
                    info={info}
                    prosTeamName={data.info.prosTeamName}
                    consTeamName={data.info.consTeamName}
                  />
                ))}
              </div>
            </section>
          )}
          {!isLoading && (
            <button
              onClick={handleOpenModal}
              className="sm:right-3 sm:top-20 sm:w-24 2xl:w-40 fixed right-2 top-16 flex w-20 flex-col items-center md:right-4 md:top-24 md:w-28 lg:right-6 lg:top-28 lg:w-32 xl:right-8 xl:top-32 xl:w-36"
            >
              <img
                src={Coins}
                alt="팀 선정하기"
                className="mb-2 h-auto w-full"
              />
              <div className="sm:px-3 sm:py-2 sm:text-sm w-full rounded-full border-[2px] border-default-disabled/hover bg-default-white px-2 py-1.5 text-xs font-semibold text-default-black transition-colors duration-200 hover:bg-default-disabled/hover md:px-4 md:py-2.5 md:text-base lg:px-5 lg:py-3 lg:text-lg xl:px-6">
                팀 선정하기
              </div>
            </button>
          )}
        </DefaultLayout.ContentContainer>

        <DefaultLayout.StickyFooterWrapper>
          <div className="mx-auto mb-8 mt-2 flex w-full max-w-4xl items-center justify-between gap-2">
            <button
              className={clsx('flex aspect-square rounded-full p-[20px]', {
                'button disabled': isLoading,
                'button enabled neutral': !isLoading,
              })}
              disabled={isLoading}
              onClick={() => {
                openShareModal();
              }}
            >
              <DTShare className="h-full" />
            </button>
            <button
              className={clsx('flex aspect-square rounded-full p-[20px]', {
                'button disabled': isLoading,
                'button enabled neutral': !isLoading,
              })}
              disabled={isLoading}
              onClick={() => {
                if (isGuestFlow()) {
                  navigate(`/composition?mode=edit&type=CUSTOMIZE`);
                } else {
                  navigate(
                    `/composition?mode=edit&tableId=${tableId}&type=CUSTOMIZE`,
                  );
                }
              }}
            >
              <DTEdit className="h-full" />
            </button>
            <div className="flex w-full space-x-2">
              <button
                className={clsx(
                  'flex flex-1 flex-row gap-[12px] rounded-full p-[24px]',
                  {
                    'button disabled': isLoading,
                    'button enabled brand': !isLoading,
                  },
                )}
                disabled={isLoading}
                onClick={handleStartDebate}
              >
                <DTDebate className="h-full" />
                토론하기
              </button>
            </div>
          </div>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout>

      <TableShareModal />
      <ModalWrapper closeButtonColor="text-natural-1000">
        <TeamSelectionModal
          onClose={closeModal}
          onStartDebate={handleStartDebate}
          onEdit={handleEdit}
          initialCoinState={modalCoinState}
          onCoinStateChange={handleCoinStateChange}
        />
      </ModalWrapper>
    </>
  );
}
