// components/TimerView.tsx
import DTExchange from '../../../components/icons/Exchange';
import { TimerPageLogics } from '../hooks/useTimerPageState';
import NormalTimer from './NormalTimer';
import TimeBasedTimer from './TimeBasedTimer';

export default function TimerView({ state }: { state: TimerPageLogics }) {
  const {
    data,
    normalTimer,
    timer1,
    timer2,
    prosConsSelected,
    index,
    isAdditionalTimerAvailable,
    handleActivateTeam,
    switchCamp,
  } = state;
  if (data && data.table[index].boxType === 'NORMAL') {
    return (
      <NormalTimer
        normalTimerInstance={{
          timer: normalTimer.timer,
          isAdditionalTimerOn: normalTimer.isAdditionalTimerOn,
          isRunning: normalTimer.isRunning,
          handleChangeAdditionalTimer: normalTimer.handleChangeAdditionalTimer,
          startTimer: normalTimer.startTimer,
          pauseTimer: normalTimer.pauseTimer,
          resetTimer: normalTimer.resetTimer,
          setTimer: normalTimer.setTimer,
        }}
        isAdditionalTimerAvailable={isAdditionalTimerAvailable}
        item={data.table[index]}
        teamName={
          data.table[index].stance === 'NEUTRAL'
            ? null
            : data.table[index].stance === 'PROS'
              ? data.info.prosTeamName
              : data.info.consTeamName
        }
      />
    );
  }
  if (data && data.table[index].boxType === 'TIME_BASED') {
    return (
      <div className="flex flex-row items-center justify-center space-x-[30px]">
        {/* 왼쪽 타이머 */}
        <TimeBasedTimer
          timeBasedTimerInstance={{
            totalTimer: timer1.totalTimer,
            speakingTimer: timer1.speakingTimer,
            isRunning: timer1.isRunning,
            startTimer: timer1.startTimer,
            pauseTimer: timer1.pauseTimer,
            resetCurrentTimer: timer1.resetCurrentTimer,
          }}
          item={data.table[index]}
          isSelected={prosConsSelected === 'PROS'}
          onActivate={() => handleActivateTeam('PROS')}
          prosCons="PROS"
          teamName={data.info.prosTeamName}
        />

        {/* ENTER 버튼 */}
        <button
          onClick={switchCamp}
          className="flex flex-col rounded-[14px] bg-default-black2 px-[32px] py-[8px] text-default-white shadow-xl"
        >
          <DTExchange className="size-[66px]" />
          <p className="text-[24px] font-semibold lg:text-[18px] lg:font-bold">
            ENTER
          </p>
        </button>

        {/* 오른쪽 타이머 */}
        <TimeBasedTimer
          timeBasedTimerInstance={{
            totalTimer: timer2.totalTimer,
            speakingTimer: timer2.speakingTimer,
            isRunning: timer2.isRunning,
            startTimer: timer2.startTimer,
            pauseTimer: timer2.pauseTimer,
            resetCurrentTimer: timer2.resetCurrentTimer,
          }}
          item={data.table[index]}
          isSelected={prosConsSelected === 'CONS'}
          onActivate={() => handleActivateTeam('CONS')}
          prosCons="CONS"
          teamName={data.info.consTeamName}
        />
      </div>
    );
  }
  return null;
}
