import { useState } from 'react';
import { TimeBoxInfo, DebateType, Stance } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';

interface TimerCreationContentProps {
  selectedStance: Stance;
  initDate?: TimeBoxInfo;
  onSubmit: (data: TimeBoxInfo) => void;
  onClose: () => void; // 모달 닫기 함수
}

export default function TimerCreationContent({
  selectedStance,
  initDate,
  onSubmit,
  onClose,
}: TimerCreationContentProps) {
  const [stance, setStance] = useState<Stance>(selectedStance);
  const [debateType, setDebateType] = useState<DebateType>(
    initDate?.type ?? 'OPENING',
  );
  const { minutes: initMinutes, seconds: initSeconds } =
    Formatting.formatSecondsToMinutes(initDate?.time ?? 180);

  const [minutes, setMinutes] = useState(initMinutes);
  const [seconds, setSeconds] = useState(initSeconds);
  const [speakerNumber, setSpeakerNumber] = useState<number | null>(
    initDate?.stance === 'NEUTRAL' ? 1 : (initDate?.speakerNumber ?? 1),
  );

  const handleSubmit = () => {
    const totalTime = minutes * 60 + seconds;
    onSubmit({
      stance,
      type: debateType,
      time: totalTime,
      ...(speakerNumber !== null && { speakerNumber }),
    });
    onClose();
  };

  const getStanceColor = () => {
    switch (stance) {
      case 'PROS':
        return 'bg-camp-blue';
      case 'CONS':
        return 'bg-camp-red';
      case 'NEUTRAL':
        return 'bg-neutral-500';
      default:
        return 'bg-neutral-500';
    }
  };

  return (
    <>
      <h2
        className={`mb-4 px-4 py-4 text-xl font-bold text-neutral-0 ${getStanceColor()}`}
      >
        타임박스 설정
      </h2>
      <div className="flex flex-col gap-4 p-4">
        <div className="flex items-center space-x-2">
          <label htmlFor="debate-type-select" className="w-16 flex-shrink-0">
            유형
          </label>
          <select
            id="debate-type-select"
            className="flex-1 rounded border p-1"
            value={debateType}
            onChange={(e) => {
              if (e.target.value === 'TIME_OUT') {
                setStance('NEUTRAL');
              } else {
                setStance(
                  selectedStance === 'NEUTRAL' ? 'CONS' : selectedStance,
                );
              }
              setDebateType(e.target.value as DebateType);
            }}
          >
            <option value="OPENING">입론</option>
            <option value="REBUTTAL">반론</option>
            <option value="CROSS">교차질의</option>
            <option value="CLOSING">최종발언</option>
            <option value="TIME_OUT">작전시간</option>
          </select>
        </div>

        <div className="flex items-center space-x-2">
          <label htmlFor="stance-select" className="w-16 flex-shrink-0">
            입장
          </label>
          <select
            id="stance-select"
            className={`flex-1 rounded border p-1 ${
              stance === 'NEUTRAL' ? 'cursor-not-allowed bg-gray-200' : ''
            }`}
            value={stance}
            onChange={(e) => setStance(e.target.value as Stance)}
            disabled={stance === 'NEUTRAL'}
          >
            {stance === 'NEUTRAL' && <option value="NEUTRAL"></option>}
            <option value="PROS">찬성</option>
            <option value="CONS">반대</option>
          </select>
        </div>

        <div className="flex w-full items-center space-x-2">
          <label htmlFor="minutes-input" className="w-16 flex-shrink-0">
            시간
          </label>
          <div className="flex w-full min-w-1 flex-wrap space-x-2">
            <div className="flex min-w-12 flex-1 items-center">
              <input
                id="minutes-input"
                type="number"
                min={0}
                className="min-w-10 flex-grow rounded border p-1 text-center"
                value={minutes.toString()}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
              <span className="ml-1 flex-shrink-0">분</span>
            </div>
            <div className="flex min-w-12 flex-1 items-center">
              <input
                id="seconds-input"
                type="number"
                min={0}
                className="min-w-10 flex-grow rounded border p-1 text-center"
                value={seconds.toString()}
                onChange={(e) => setSeconds(Number(e.target.value))}
              />
              <span className="ml-1 flex-shrink-0">초</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center space-x-2">
          <label htmlFor="speaker-number-input" className="w-16 flex-shrink-0">
            발언자
          </label>
          <select
            id="speaker-number-input"
            className="flex-1 rounded border p-1"
            value={stance === 'NEUTRAL' ? 0 : (speakerNumber ?? 0)}
            onChange={(e) => {
              setSpeakerNumber(
                e.target.value === '0' ? null : Number(e.target.value),
              );
            }}
            disabled={stance === 'NEUTRAL'}
          >
            <option value="0">없음</option>
            <option value="1">1번 토론자</option>
            <option value="2">2번 토론자</option>
            <option value="3">3번 토론자</option>
            <option value="4">4번 토론자</option>
            <option value="5">5번 토론자</option>
          </select>
        </div>

        <button
          className="mt-4 w-full rounded bg-amber-300 p-2 font-semibold hover:bg-amber-500"
          onClick={handleSubmit}
        >
          시간표 설정
        </button>
      </div>
    </>
  );
}
