// components/TimerView.tsx
import { TimerPageLogics } from '../hooks/useTimerPageState';
import NormalTimer from './NormalTimer';
import TimeBasedTimer from './TimeBasedTimer';
import { FaExchangeAlt } from 'react-icons/fa';
import TimeBasedTimerTitle from './TimeBasedTimerTitle';

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
  if (data?.table[index].boxType === 'NORMAL') {
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
  if (data?.table[index].boxType === 'TIME_BASED') {
    return (
      <div className="flex flex-col space-y-12">
        {/* 현재 순서 제목 */}
        <TimeBasedTimerTitle>
          <h1 className="truncate text-[32px] font-bold text-neutral-900">
            {data.table[index].speechType}
          </h1>
        </TimeBasedTimerTitle>

        <section className="relative flex flex-row items-center justify-center space-x-[30px]">
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
            isSelected={prosConsSelected === 'PROS'}
            onActivate={() => handleActivateTeam('PROS')}
            prosCons="PROS"
            teamName={data.info.prosTeamName}
          />
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
            isSelected={prosConsSelected === 'CONS'}
            onActivate={() => handleActivateTeam('CONS')}
            prosCons="CONS"
            teamName={data.info.consTeamName}
          />
          {/* ENTER 버튼 */}
          <button
            onClick={switchCamp}
            className="absolute left-1/2 top-1/2 flex h-[78px] w-[78px] -translate-x-[70px] -translate-y-6 flex-col items-center justify-center rounded-full bg-neutral-600 text-white shadow-lg transition hover:bg-neutral-500 lg:h-[100px] lg:w-[100px] lg:-translate-x-20 lg:-translate-y-8"
          >
            <FaExchangeAlt className="text-[28px] lg:text-[36px]" />
            <span className="text-[12px] font-semibold lg:text-[18px] lg:font-bold">
              ENTER
            </span>
          </button>
        </section>
      </div>
    );
  }
  return null;
}
