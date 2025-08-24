import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { useTimerPageState } from './hooks/useTimerPageState';
import { useTimerHotkey } from './hooks/useTimerHotkey';
import RoundControlRow from './components/RoundControlRow';
import TimerView from './components/TimerView';
import { FirstUseToolTipModal } from './components/FirstUseToolTipModal';
import { LoginAndStoreModal } from './components/LoginAndStoreModal';
import { useTimerPageModal } from './hooks/useTimerPageModal';
import { bgColorMap } from '../../type/type';
import DTHelp from '../../components/icons/Help';
import clsx from 'clsx';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';

export default function TimerPage() {
  const pathParams = useParams();
  const tableId = Number(pathParams.id);
  const {
    openUseTooltipModal,
    UseToolTipWrapper,
    closeUseTooltipModal,
    LoginAndStoreModalWrapper,
    closeLoginAndStoreModal,
    openLoginAndStoreModalOrGoToOverviewPage,
  } = useTimerPageModal(tableId);

  const state = useTimerPageState(tableId);

  useTimerHotkey(state);
  const { data, bg, index, goToOtherItem, isLoading, isError, refetch } = state;

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
            {!isLoading && data && (
              <HeaderTableInfo
                name={
                  data.info.name.trim() === ''
                    ? '테이블 이름 없음'
                    : data.info.name
                }
              />
            )}
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            {!isLoading && data && (
              <HeaderTitle
                title={
                  data.info.agenda.trim() === ''
                    ? '주제 없음'
                    : data.info.agenda
                }
              />
            )}
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <button
              className="flex h-full items-center justify-center"
              onClick={openUseTooltipModal}
            >
              <DTHelp className="size-full" />
            </button>
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContainer noPadding={true}>
          {isLoading && <LoadingIndicator />}
          {!isLoading && (
            <div
              className={clsx(
                'relative flex h-full w-full flex-col items-center justify-center space-y-[32px] xl:space-y-[60px]',
                bgColorMap[bg],
              )}
            >
              {/* 타이머 두 개 + ENTER 버튼 */}
              <TimerView state={state} />
              {/* Round control buttons on the bottom side */}
              {data && (
                <RoundControlRow
                  table={data.table}
                  index={index}
                  goToOtherItem={goToOtherItem}
                  openDoneModal={openLoginAndStoreModalOrGoToOverviewPage}
                  className="absolute bottom-[66px]"
                />
              )}
            </div>
          )}
        </DefaultLayout.ContentContainer>
      </DefaultLayout>

      {/* Modal for users who have not used this timer */}
      <FirstUseToolTipModal
        Wrapper={UseToolTipWrapper}
        onClose={closeUseTooltipModal}
      />

      {/* Modal that asks users whether they want to store the timetable in their account */}
      <LoginAndStoreModal
        Wrapper={LoginAndStoreModalWrapper}
        onClose={closeLoginAndStoreModal}
      />
    </>
  );
}
