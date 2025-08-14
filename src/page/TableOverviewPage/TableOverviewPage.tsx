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
import Coins from '../../assets/teamSelection/coins.png';
import TeamSelectionModal from './components/TeamSelectionModal/TeamSelectionModal';
import { useModal } from '../../hooks/useModal';

export default function TableOverviewPage() {
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();
  const { openModal, closeModal, ModalWrapper } = useModal();

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
              onClick={openModal}
              className="sm:right-3 sm:top-20 sm:w-24 2xl:w-40 fixed right-2 top-16 flex w-20 flex-col items-center md:right-4 md:top-24 md:w-28 lg:right-6 lg:top-28 lg:w-32 xl:right-8 xl:top-32 xl:w-36"
            >
              <img
                src={Coins}
                alt="팀 선정하기"
                className="mb-2 h-auto w-full"
              />
              <div className="sm:px-3 sm:py-2 sm:text-sm w-full rounded-full bg-brand-main px-2 py-1.5 text-xs font-bold shadow-lg md:px-4 md:py-2.5 md:text-base lg:px-5 lg:py-3 lg:text-lg xl:px-6">
                팀 선정하기
              </div>
            </button>
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
                onClick={handleStartDebate}
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
      <ModalWrapper closeButtonColor="text-natural-1000">
        <TeamSelectionModal
          onClose={closeModal}
          onStartDebate={handleStartDebate}
        />
      </ModalWrapper>
    </>
  );
}
