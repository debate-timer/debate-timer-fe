import { useState } from 'react';
import { DebateInfo, DebateType, Stance } from '../../../../type/type';

interface TimerCreationContentProps {
  initStance: Stance;
  onSubmit: (data: DebateInfo) => void;
  onClose: () => void; // 모달 닫기 함수
}

export default function TimerCreationContent({
  initStance,
  onSubmit,
  onClose,
}: TimerCreationContentProps) {
  const [stance, setStance] = useState<Stance>(initStance);
  const [debateType, setDebateType] = useState<DebateType>('OPENING');

  const [minutes, setMinutes] = useState(2);
  const [seconds, setSeconds] = useState(30);
  const [speakerNumber, setSpeakerNumber] = useState(3);

  const handleSubmit = () => {
    const totalTime = minutes * 60 + seconds;
    onSubmit({
      stance,
      debateType,
      time: totalTime,
      speakerNumber,
    });
    onClose();
  };

  return (
    <div className="p-10">
      <h2 className="mb-4 text-xl font-bold">타임박스 설정</h2>
      <div className="flex flex-col space-y-6">
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
            <option value="PROS">찬성</option>
            <option value="CONS">반대</option>
          </select>
        </div>

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
                setStance(initStance);
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
                value={minutes}
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
                value={seconds}
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
          <input
            id="speaker-number-input"
            type="number"
            min={1}
            className="min-w-0 flex-grow rounded border p-1 text-center"
            value={speakerNumber}
            onChange={(e) => setSpeakerNumber(Number(e.target.value))}
          />
        </div>

        <button
          className="mt-4 w-full rounded bg-amber-300 p-2 hover:bg-amber-500"
          onClick={handleSubmit}
        >
          타임박스 설정하기
        </button>
      </div>
    </div>
  );
}
