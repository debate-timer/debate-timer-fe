import { useParams } from 'react-router-dom';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTableInfo from '../../components/HeaderTableInfo/HeaderTableInfo';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import IconButton from '../../components/IconButton/IconButton';
import { IoHelpCircle } from 'react-icons/io5';
import { useTimerPageState } from './hooks/useTimerPageState';
import { useTimerHotkey } from './hooks/useTimerHotkey';
import RoundControlRow from './components/RoundControlRow';
import TimerView from './components/TimerView';
import { FirstUseToolTipModal } from './components/FirstUseToolTipModal';
import { LoginAndStoreModal } from './components/LoginAndStoreModal';
import { useTimerPageModal } from './hooks/useTimerPageModal';
import { bgColorMap } from '../../type/type';

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
  const { warningBellRef, finishBellRef, data, bg, index, goToOtherItem } =
    state;

  if (!data) {
    return null;
  }

  return (
    <>
      <audio ref={warningBellRef} src="/sounds/bell-warning.mp3" />
      <audio ref={finishBellRef} src="/sounds/bell-finish.mp3" />

      <DefaultLayout>
        <DefaultLayout.Header>
          <DefaultLayout.Header.Left>
            <HeaderTableInfo
              name={
                data === undefined || data.info.name.trim() === ''
                  ? '테이블 이름 없음'
                  : data.info.name
              }
            />
          </DefaultLayout.Header.Left>
          <DefaultLayout.Header.Center>
            <HeaderTitle
              title={
                data === undefined || data.info.agenda.trim() === ''
                  ? '주제 없음'
                  : data.info.agenda
              }
            />
          </DefaultLayout.Header.Center>
          <DefaultLayout.Header.Right>
            <IconButton
              icon={<IoHelpCircle size={24} />}
              onClick={openUseTooltipModal}
            />
          </DefaultLayout.Header.Right>
        </DefaultLayout.Header>

        {/* Containers */}
        <DefaultLayout.ContentContainer noPadding={true}>
          <div
            className={`flex h-full w-full flex-col items-center justify-center space-y-[25px] xl:space-y-[40px] ${bgColorMap[bg]}`}
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
              />
            )}
          </div>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
      <FirstUseToolTipModal
        Wrapper={UseToolTipWrapper}
        onClose={closeUseTooltipModal}
      />
      <LoginAndStoreModal
        Wrapper={LoginAndStoreModalWrapper}
        onClose={closeLoginAndStoreModal}
      />
    </>
  );
}
