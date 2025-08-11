import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import PropsAndConsTitle from '../../components/ProsAndConsTitle/PropsAndConsTitle';
import { useNavigate, useParams } from 'react-router-dom';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import usePatchDebateTable from '../../hooks/mutations/usePatchDebateTable';
import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import TimeBox from '../TableComposition/components/TimeBox/TimeBox';
import { useTableShare } from '../../hooks/useTableShare';
import { StanceToString } from '../../type/type';
import { isGuestFlow } from '../../util/sessionStorage';
import DTShare from '../../components/icons/Share';
import DTDebate from '../../components/icons/Debate';
import DTEdit from '../../components/icons/Edit';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import clsx from 'clsx';

export default function TableOverviewPage() {
  const { id } = useParams();
  const tableId = Number(id);
  const navigate = useNavigate();

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
                onClick={() => {
                  if (isGuestFlow()) {
                    navigate('/table/customize/guest');
                  } else {
                    onModifyCustomizeTableData.mutate({ tableId });
                  }
                }}
              >
                <DTDebate className="h-full" />
                토론하기
              </button>
            </div>
          </div>
        </DefaultLayout.StickyFooterWrapper>
      </DefaultLayout>

      <TableShareModal />
    </>
  );
}
