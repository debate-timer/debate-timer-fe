import { useState } from 'react';
import { TimeBoxInfo, DebateType, Stance } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';

interface TimerCreationContentProps {
  beforeData?: TimeBoxInfo;
  initData?: TimeBoxInfo;
  onSubmit: (data: TimeBoxInfo) => void;
  onClose: () => void;
}

export default function TimerCreationContent({
  beforeData,
  initData,
  onSubmit,
  onClose,
}: TimerCreationContentProps) {
  const [stance, setStance] = useState<Stance>(
    beforeData?.stance
      ? beforeData?.stance === 'NEUTRAL'
        ? 'PROS'
        : beforeData?.stance === 'CONS'
          ? 'PROS'
          : 'CONS'
      : (initData?.stance ?? 'PROS'),
  );

  const [debateType, setDebateType] = useState<DebateType>(
    beforeData?.type ?? initData?.type ?? 'OPENING',
  );
  const { minutes: initMinutes, seconds: initSeconds } =
    Formatting.formatSecondsToMinutes(
      beforeData?.time ?? initData?.time ?? 180,
    );

  const [minutes, setMinutes] = useState(initMinutes);
  const [seconds, setSeconds] = useState(initSeconds);
  const [speakerNumber, setSpeakerNumber] = useState<number | null>(
    (beforeData?.speakerNumber ?? initData?.stance === 'NEUTRAL')
      ? null
      : (initData?.speakerNumber ?? 1),
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

  const validateTime = (value: string) => {
    if (value === '') return 0; // 빈 값 허용
    const num = Math.max(0, Math.min(59, Number(value))); // 0~59 범위 유지
    return num;
  };

  return (
    <div className="relative aspect-square min-w-[400px]">
      <h2
        className={`mb-4 px-4 py-4 text-xl font-bold text-neutral-0 ${getStanceColor()}`}
      >
        시간표 설정
      </h2>
      <div className="flex flex-col gap-6 p-4">
        <div className="flex items-center space-x-2">
          <label
            htmlFor="debate-type-select"
            className="w-16 flex-shrink-0 font-semibold"
          >
            유형
          </label>
          <select
            id="debate-type-select"
            className="flex-1 rounded border p-1"
            value={debateType}
            onChange={(e) => {
              if (e.target.value === 'TIME_OUT') {
                setStance('NEUTRAL');
              } else if (
                stance === 'NEUTRAL' &&
                e.target.value !== 'TIME_OUT'
              ) {
                setStance('PROS');
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
          <label
            htmlFor="stance-select"
            className="w-16 flex-shrink-0 font-semibold"
          >
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
            {stance === 'NEUTRAL' && <option value="NEUTRAL" />}
            <option value="PROS">찬성</option>
            <option value="CONS">반대</option>
          </select>
        </div>

        <div className="flex w-full items-center space-x-2">
          <label
            htmlFor="minutes-input"
            className="w-16 flex-shrink-0 font-semibold"
          >
            시간
          </label>
          <div className="flex w-full min-w-1 flex-wrap space-x-2">
            <div className="flex min-w-10 flex-1 items-center">
              <input
                id="minutes-input"
                type="number"
                min={0}
                max={59}
                className="min-w-8 flex-grow rounded border p-1"
                value={minutes.toString()}
                onChange={(e) => setMinutes(validateTime(e.target.value))}
              />
              <span className="ml-1 flex-shrink-0">분</span>
            </div>
            <div className="flex min-w-10 flex-1 items-center">
              <input
                id="seconds-input"
                type="number"
                min={0}
                max={59}
                className="min-w-8 flex-grow rounded border p-1"
                value={seconds.toString()}
                onChange={(e) => setSeconds(validateTime(e.target.value))}
              />
              <span className="ml-1 flex-shrink-0">초</span>
            </div>
          </div>
        </div>

        <div className="flex min-w-0 items-center space-x-2">
          <label
            htmlFor="speaker-number-input"
            className="w-16 flex-shrink-0 font-semibold"
          >
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
          className="absolute bottom-4 left-4 right-4 mt-4 rounded bg-amber-300 p-2 font-semibold hover:bg-amber-500"
          onClick={handleSubmit}
        >
          시간표 설정
        </button>
      </div>
    </div>
  );
}
