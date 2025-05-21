import { useState, useEffect } from 'react';
import { TimeBoxInfo, Stance, TimeBoxType } from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import normalTimer from '../../../../../public/timer/normal_timer.png';
import timeBasedTimer from '../../../../../public/timer/timebased_timer.png';
import LabeledCheckbox from '../../../../components/LabledCheckBox/LabeledCheckbox';
import timeBasedPerSpeakingTimer from '../../../../../public/timer/timebased_perSpeaking_timer.png';

interface TimerCreationContentProps {
  beforeData?: TimeBoxInfo;
  initData?: TimeBoxInfo;
  prosTeamName: string;
  consTeamName: string;
  onSubmit: (data: TimeBoxInfo) => void;
  onClose: () => void;
}

export default function TimerCreationContent({
  beforeData,
  initData,
  prosTeamName,
  consTeamName,
  onSubmit,
  onClose,
}: TimerCreationContentProps) {
  const [stance, setStance] = useState<Stance>(
    beforeData?.stance
      ? beforeData?.stance === 'NEUTRAL'
        ? 'NEUTRAL'
        : beforeData?.stance === 'CONS'
          ? 'PROS'
          : 'CONS'
      : (initData?.stance ?? 'PROS'),
  );
  const [boxType, setBoxType] = useState<TimeBoxType>(
    beforeData?.boxType ?? initData?.boxType ?? 'NORMAL',
  );

  const predefinedSpeechOptions = ['입론', '반론', '최종 발언', '작전 시간'];

  const initSpeechType =
    beforeData?.speechType ?? initData?.speechType ?? '입론';
  const [speechType, setSpeechType] = useState<string>(initSpeechType);
  const [isCustomSpeech, setIsCustomSpeech] = useState(
    !predefinedSpeechOptions.includes(initSpeechType),
  );

  // 발언 시간
  const { minutes: initMinutes, seconds: initSeconds } =
    Formatting.formatSecondsToMinutes(
      beforeData?.time ?? initData?.time ?? 180,
    );
  const [minutes, setMinutes] = useState(initMinutes);
  const [seconds, setSeconds] = useState(initSeconds);

  // 팀당 발언 시간
  const { minutes: initTeamMinutes, seconds: initTeamSeconds } =
    Formatting.formatSecondsToMinutes(
      beforeData?.timePerTeam ?? initData?.timePerTeam ?? 180,
    );
  const [teamMinutes, setTeamMinutes] = useState(initTeamMinutes);
  const [teamSeconds, setTeamSeconds] = useState(initTeamSeconds);

  // 1회당 발언 시간
  const { minutes: initSpeakerMinutes, seconds: initSpeakerSeconds } =
    Formatting.formatSecondsToMinutes(
      beforeData?.timePerSpeaking ?? initData?.timePerSpeaking ?? 180,
    );
  const [speakerMinutes, setSpeakerMinutes] = useState(initSpeakerMinutes);
  const [speakerSeconds, setSpeakerSeconds] = useState(initSpeakerSeconds);

  const [useSpeakerTime, setUseSpeakerTime] = useState<boolean>(
    (beforeData?.timePerSpeaking ?? initData?.timePerSpeaking) != null,
  );

  const [speaker, setSpeaker] = useState<string>(
    beforeData?.speaker ?? initData?.speaker ?? '',
  );

  const handleSubmit = () => {
    const totalTime = minutes * 60 + seconds;
    const totalTimePerTeam = teamMinutes * 60 + teamSeconds;
    const totalTimePerSpeaking = speakerMinutes * 60 + speakerSeconds;

    const errors: string[] = [];
    // 텍스트 길이 유효성 검사
    if (speechType.length > 10) {
      errors.push('발언 유형은 최대 10자까지 입력할 수 있습니다.');
    }
    if (speaker.length > 5) {
      errors.push('발언자는 최대 5자까지 입력할 수 있습니다.');
    }
    // 발언시간 유효성 검사
    if (
      boxType === 'TIME_BASED' &&
      useSpeakerTime &&
      totalTimePerSpeaking > totalTimePerTeam
    ) {
      errors.push('1회당 발언 시간은 팀당 총 발언 시간보다 클 수 없습니다.');
    }
    // 커스텀 타이머 발언유형 유효성 검사
    if (boxType === 'NORMAL' && speechType.trim() === '') {
      errors.push('발언 유형을 입력해주세요.');
    }
    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    }

    if (boxType === 'NORMAL') {
      onSubmit({
        stance,
        speechType,
        boxType,
        time: totalTime,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker,
      });
    } else {
      // TIME_BASED
      onSubmit({
        stance: 'NEUTRAL',
        speechType: speechType.trim() === '' ? '자유 토론' : speechType,
        boxType,
        time: null,
        timePerTeam: totalTimePerTeam,
        timePerSpeaking: useSpeakerTime ? totalTimePerSpeaking : null,
        speaker: null,
      });
    }
    onClose();
  };

  const validateTime = (value: string) =>
    value === '' ? 0 : Math.max(0, Math.min(59, Number(value)));

  const isNormalTimer = boxType === 'NORMAL';
  // 자유토론 타이머로 전환되면 speechType 초기화
  useEffect(() => {
    if (!isNormalTimer) {
      // 자유토론 타이머로 전환 시
      if (!initData?.speechType) {
        setSpeechType('');
      }
      setIsCustomSpeech(true);
    } else {
      // 일반 타이머로 전환 시, speechType이 predefined에 있으면 custom 아님
      setIsCustomSpeech(!predefinedSpeechOptions.includes(speechType));
    }
    if (stance === 'NEUTRAL') {
      setSpeaker('');
    }
  }, [
    isNormalTimer,
    stance,
    speechType,
    predefinedSpeechOptions,
    initData?.speechType,
  ]);

  return (
    <div className="relative p-6">
      <div className="flex flex-col gap-1">
        <div className="flex h-[280px] flex-row items-center justify-center p-2">
          <div className="flex h-[260px] w-[260px] justify-center">
            {/** 타이머 이미지 */}
            {isNormalTimer ? (
              <img
                src={normalTimer}
                alt="normal-timer"
                className="h-full object-contain"
              />
            ) : useSpeakerTime ? (
              <img
                src={timeBasedPerSpeakingTimer}
                alt="timebased-per-speaking-timer"
                className="h-full object-contain"
              />
            ) : (
              <img
                src={timeBasedTimer}
                alt="timebased-timer"
                className="h-full object-contain"
              />
            )}
          </div>

          <div className="flex w-[350px] flex-col gap-6 p-5">
            {/** boxType 라디오버튼 */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="debate-type-select"
                className="w-16 flex-shrink-0 font-semibold"
              >
                종류
              </label>
              <div className="flex w-full justify-between space-x-2">
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="boxType"
                    value="NORMAL"
                    checked={boxType === 'NORMAL'}
                    onChange={(e) => setBoxType(e.target.value as TimeBoxType)}
                  />
                  일반 타이머
                </label>
                <label className="flex cursor-pointer items-center gap-2">
                  <input
                    type="radio"
                    name="boxType"
                    value="TIME_BASED"
                    checked={boxType === 'TIME_BASED'}
                    onChange={(e) => setBoxType(e.target.value as TimeBoxType)}
                  />
                  자유 토론 타이머
                </label>
              </div>
            </div>
            {/** 발언유형 */}
            <div className="flex items-center space-x-2">
              <label
                htmlFor="debate-type-select"
                className="w-16 flex-shrink-0 font-semibold"
              >
                발언유형
              </label>

              {isNormalTimer && (
                <select
                  id="speech-type-select"
                  className="flex flex-grow rounded border p-1"
                  value={
                    predefinedSpeechOptions.includes(speechType)
                      ? speechType
                      : '직접 입력'
                  }
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    if (selectedValue === '작전 시간') {
                      setStance('NEUTRAL');
                    } else if (
                      stance === 'NEUTRAL' &&
                      selectedValue !== '작전 시간'
                    ) {
                      setStance('PROS');
                    }
                    if (selectedValue === '직접 입력') {
                      setIsCustomSpeech(true);
                      setSpeechType('');
                    } else {
                      setIsCustomSpeech(false);
                      setSpeechType(selectedValue);
                    }
                  }}
                >
                  <option value="입론">입론</option>
                  <option value="반론">반론</option>
                  <option value="최종 발언">최종 발언</option>
                  <option value="작전 시간">작전 시간</option>
                  <option value="직접 입력">직접 입력</option>
                </select>
              )}
              {isCustomSpeech && (
                <input
                  id="speech-type-input"
                  type="text"
                  className="flex w-full rounded border p-1"
                  value={speechType}
                  onChange={(e) => {
                    setSpeechType(e.target.value);
                  }}
                  placeholder={isNormalTimer ? '예) 보충 질의' : '자유 토론'}
                />
              )}
            </div>
            {/** 팀 */}
            {isNormalTimer && (
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="stance-select"
                  className="w-16 flex-shrink-0 font-semibold"
                >
                  팀
                </label>
                <select
                  id="stance-select"
                  className={`flex-1 rounded border p-1 ${
                    speechType === '작전 시간'
                      ? 'cursor-not-allowed bg-gray-100'
                      : ''
                  }`}
                  value={stance}
                  onChange={(e) => setStance(e.target.value as Stance)}
                  disabled={speechType === '작전 시간'}
                >
                  <option value="PROS">{prosTeamName}</option>
                  <option value="CONS">{consTeamName}</option>
                  {(stance === 'NEUTRAL' || isCustomSpeech) && (
                    <option value="NEUTRAL">공통</option>
                  )}
                </select>
              </div>
            )}
            {/* 시간 */}
            {isNormalTimer && (
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
            )}
            {/** 팀당 총 발언시간 */}
            {!isNormalTimer && (
              <>
                <div className="flex w-full items-center space-x-2">
                  <label
                    htmlFor="team-minutes-input"
                    className="w-24 flex-shrink-0 font-semibold"
                  >
                    팀당 <br />총 발언 시간
                  </label>
                  <div className="flex w-full min-w-1 flex-wrap space-x-2">
                    <div className="flex min-w-10 flex-1 items-center">
                      <input
                        id="team-minutes-input"
                        type="number"
                        min={0}
                        max={59}
                        className="min-w-8 flex-grow rounded border p-1"
                        value={teamMinutes.toString()}
                        onChange={(e) =>
                          setTeamMinutes(validateTime(e.target.value))
                        }
                      />
                      <span className="ml-1 flex-shrink-0">분</span>
                    </div>
                    <div className="flex min-w-10 flex-1 items-center">
                      <input
                        id="team-seconds-input"
                        type="number"
                        min={0}
                        max={59}
                        className="min-w-8 flex-grow rounded border p-1"
                        value={teamSeconds.toString()}
                        onChange={(e) =>
                          setTeamSeconds(validateTime(e.target.value))
                        }
                      />
                      <span className="ml-1 flex-shrink-0">초</span>
                    </div>
                  </div>
                </div>
                {/** 1회당 발언시간 */}
                <div className="flex w-full items-center space-x-2">
                  <div className="w-24 flex-shrink-0">
                    <LabeledCheckbox
                      id="speaker-toggle"
                      label={
                        <span className="ml-1 font-semibold">
                          1회당 <br /> 발언 시간
                        </span>
                      }
                      checked={useSpeakerTime}
                      onChange={() => setUseSpeakerTime((prev) => !prev)}
                    />
                  </div>
                  <div
                    className={`flex w-full min-w-1 flex-wrap space-x-2 ${
                      useSpeakerTime ? '' : 'text-gray-400'
                    }`}
                  >
                    <div className="flex min-w-10 flex-1 items-center">
                      <input
                        id="speaker-minutes-input"
                        type="number"
                        min={0}
                        max={59}
                        className="min-w-8 flex-grow rounded border p-1"
                        value={speakerMinutes.toString()}
                        onChange={(e) =>
                          setSpeakerMinutes(validateTime(e.target.value))
                        }
                        disabled={!useSpeakerTime}
                      />
                      <span className="ml-1 flex-shrink-0">분</span>
                    </div>
                    <div className="flex min-w-10 flex-1 items-center">
                      <input
                        id="speaker-seconds-input"
                        type="number"
                        min={0}
                        max={59}
                        className="min-w-8 flex-grow rounded border p-1"
                        value={speakerSeconds.toString()}
                        onChange={(e) =>
                          setSpeakerSeconds(validateTime(e.target.value))
                        }
                        disabled={!useSpeakerTime}
                      />
                      <span className="ml-1 flex-shrink-0">초</span>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/** 발언자 */}
            {isNormalTimer && (
              <div className="flex min-w-0 items-center space-x-2">
                <label
                  htmlFor="speaker-number-input"
                  className="w-16 flex-shrink-0 font-semibold"
                >
                  발언자
                </label>
                <input
                  id="speaker-input"
                  type="text"
                  className={`flex flex-grow rounded border p-1 ${
                    stance === 'NEUTRAL' ? 'cursor-not-allowed bg-gray-100' : ''
                  }`}
                  value={speaker}
                  onChange={(e) => {
                    if (stance === 'NEUTRAL') {
                      setSpeaker('');
                    } else {
                      setSpeaker(e.target.value);
                    }
                  }}
                  placeholder="1번"
                  disabled={stance === 'NEUTRAL'}
                />
                <span className="whitespace-nowrap">토론자</span>
              </div>
            )}
          </div>
        </div>
        <button
          className="rounded-xl border-[1px] border-neutral-700 p-2 text-[18px] font-semibold hover:bg-brand-main"
          onClick={handleSubmit}
        >
          설정 완료
        </button>
      </div>
    </div>
  );
}
