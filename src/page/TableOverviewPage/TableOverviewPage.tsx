import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { RiEditFill, RiSpeakFill } from 'react-icons/ri';
import usePatchDebateTable from '../../hooks/mutations/usePatchDebateTable';
import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import TimeBox from '../TableComposition/components/TimeBox/TimeBox';
import { useTableShare } from '../../hooks/useTableShare';
import { MdOutlineIosShare } from 'react-icons/md';
import { StanceToString } from '../../type/type';
import { isGuestFlow } from '../../util/sessionStorage';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import TeamSelectionModal from '../../components/TeamSelectionModal/TeamSelectionModal';
import { useState } from 'react';
import Coins from '../../assets/teamSelection/coins.png';

export default function TableOverviewPage() {
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();
  const [isTeamSelectionModalOpen, setIsTeamSelectionModalOpen] = useState(false);

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

  // If error, print error message and let user be able to retry
  if (isError) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => refetch()} />
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }

  // If no error or on loading, print contents
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
            <div className="fixed right-4 top-32 flex flex-col items-center w-[10%]">
              <img src={Coins} alt="" />
              <button
                className="w-full bg-brand-main px-4 py-2 shadow-lg transition-colors rounded-full"  
                onClick={() => {
                  setIsTeamSelectionModalOpen(true);
                }}
              >
                팀 선정하기
              </button>
            </div>
          )}
        </DefaultLayout.ContentContainer>

        <DefaultLayout.StickyFooterWrapper>
          <div className="mx-auto mb-8 flex w-full max-w-4xl items-center justify-between gap-2">
            <button
              className={`button ${isLoading ? 'disabled' : 'enabled-hover-neutral'} h-16 w-full`}
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
              <div className="flex items-center justify-center gap-2">
                <RiEditFill />
                수정하기
              </div>
            </button>
            <div className="flex h-16 w-full space-x-2">
              <button
                className={`button ${isLoading ? 'disabled' : 'enabled'} flex-1`}
                disabled={isLoading}
                onClick={() => {
                  if (isGuestFlow()) {
                    navigate('/table/customize/guest');
                  } else {
                    onModifyCustomizeTableData.mutate({ tableId });
                  }
                }}
              >
                <div className="flex items-center justify-center gap-2">
                  <RiSpeakFill />
                  토론하기
                </div>
              </button>

              <button
                className={`button ${isLoading ? 'disabled' : 'enabled-hover-neutral'} flex size-16 items-center justify-center`}
                disabled={isLoading}
                onClick={() => {
                  openShareModal();
                }}
              >
                <MdOutlineIosShare className="m-4 size-full" />
              </button>
            </div>
          </div>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout>

      <TableShareModal />
      <TeamSelectionModal
        isOpen={isTeamSelectionModalOpen}
        onClose={() => setIsTeamSelectionModalOpen(false)}
        onStartDebate={handleStartDebate}
      />
    </>
  );
}
