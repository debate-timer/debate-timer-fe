import { useCallback, useMemo, useState } from 'react';
import {
  TimeBoxInfo,
  Stance,
  TimeBoxType,
  BellType,
  BellTypeToString,
  BellConfig,
} from '../../../../type/type';
import { Formatting } from '../../../../util/formatting';
import normalTimerProsImage from '../../../../assets/timer/normal_timer_pros.jpg';
import normalTimerConsImage from '../../../../assets/timer/normal_timer_cons.jpg';
import normalTimerNeutralImage from '../../../../assets/timer/normal_timer_neutral.jpg';
import timeBasedTimerImage from '../../../../assets/timer/time_based_timer.jpg';
import timeBasedTimerOnlyTotalImage from '../../../../assets/timer/time_based_timer_only_total.jpg';
import DTClose from '../../../../components/icons/Close';
import TimerCreationContentItem from './TimerCreationContentMenuItem';
import LabeledRadioButton from '../../../../components/LabeledRadioButton/LabeledRadioButton';
import ClearableInput from '../../../../components/ClearableInput/ClearableInput';
import DropdownMenu, {
  DropdownMenuItem,
} from '../../../../components/DropdownMenu/DropdownMenu';
import clsx from 'clsx';
import TimeInputGroup from './TimeInputGroup';
import DTBell from '../../../../components/icons/Bell';
import DTAdd from '../../../../components/icons/Add';

type TimerCreationOption =
  | 'TIMER_TYPE'
  | 'SPEECH_TYPE_NORMAL'
  | 'SPEECH_TYPE_TIME_BASED'
  | 'TEAM'
  | 'TIME_PER_TEAM'
  | 'TIME_PER_SPEAKING'
  | 'SPEAKER'
  | 'TIME_NORMAL'
  | 'BELL';

type SpeechType = 'OPENING' | 'REBUTTAL' | 'TIMEOUT' | 'CLOSING' | 'CUSTOM';

const SPEECH_TYPE_RECORD: Record<SpeechType, string> = {
  OPENING: '입론',
  CLOSING: '최종 발언',
  CUSTOM: '직접 입력',
  REBUTTAL: '반론',
  TIMEOUT: '작전 시간',
} as const;

const STANCE_RECORD: Record<Stance, string> = {
  PROS: '찬성',
  CONS: '반대',
  NEUTRAL: '중립',
} as const;

const NORMAL_OPTIONS: TimerCreationOption[] = [
  'TIMER_TYPE',
  'SPEECH_TYPE_NORMAL',
  'TEAM',
  'TIME_NORMAL',
  'SPEAKER',
  'BELL',
] as const;

const TIME_BASED_OPTIONS: TimerCreationOption[] = [
  'TIMER_TYPE',
  'SPEECH_TYPE_TIME_BASED',
  'TIME_PER_TEAM',
  'TIME_PER_SPEAKING',
] as const;

const SAVED_BELL_CONFIGS_KEY = 'savedBellInputConfigs';

interface TimerCreationContentProps {
  beforeData?: TimeBoxInfo;
  initData?: TimeBoxInfo;
  prosTeamName: string;
  consTeamName: string;
  onSubmit: (data: TimeBoxInfo) => void;
  onClose: () => void;
}

interface BellInputConfig {
  type: BellType;
  min: number;
  sec: number;
  count: number;
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
  const [timerType, setTimerType] = useState<TimeBoxType>(
    beforeData?.boxType ?? initData?.boxType ?? 'NORMAL',
  );

  // 발언 유형 초기화
  const getSpeechTypeFromString = (value: string): SpeechType => {
    switch (value.trim()) {
      case '입론':
        return 'OPENING';
      case '반론':
        return 'REBUTTAL';
      case '최종발언':
      case '최종 발언':
        return 'CLOSING';
      case '작전시간':
      case '작전 시간':
        return 'TIMEOUT';
      default:
        return 'CUSTOM';
    }
  };

  const initBellInput: BellInputConfig = useMemo(() => {
    return {
      type: 'BEFORE_END', // 기본값: 종료 전
      min: 0,
      sec: 0,
      count: 1,
    };
  }, []);

  const initSpeechType =
    beforeData?.speechType ?? initData?.speechType ?? '입론';
  const [currentSpeechType, setCurrentSpeechType] = useState<SpeechType>(
    getSpeechTypeFromString(initSpeechType),
  );
  const [speechTypeTextValue, setSpeechTypeTextValue] = useState<string>(
    currentSpeechType === 'CUSTOM'
      ? (initData?.speechType ?? '')
      : SPEECH_TYPE_RECORD[currentSpeechType],
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
      beforeData?.timePerSpeaking ?? initData?.timePerSpeaking ?? 0,
    );
  const [speakerMinutes, setSpeakerMinutes] = useState(initSpeakerMinutes);
  const [speakerSeconds, setSpeakerSeconds] = useState(initSpeakerSeconds);

  const [speaker, setSpeaker] = useState<string>(
    beforeData?.speaker ?? initData?.speaker ?? '',
  );

  // 시간 총량제 타이머 샘플 이미지 및 대체 텍스트 결정
  const isSpeakingTimerDisabled = speakerMinutes === 0 && speakerSeconds === 0;
  const timeBasedPreviewSrc = isSpeakingTimerDisabled
    ? timeBasedTimerOnlyTotalImage
    : timeBasedTimerImage;
  const timeBasedPreviewAlt = isSpeakingTimerDisabled
    ? 'time-based-timer-only-total-timer'
    : 'time-based-timer';

  // 이전 종소리 설정
  const rawBellConfigData = sessionStorage.getItem(SAVED_BELL_CONFIGS_KEY);
  const defaultBellConfig: BellInputConfig[] = [
    { type: 'BEFORE_END', min: 0, sec: 30, count: 1 },
    { type: 'BEFORE_END', min: 0, sec: 0, count: 2 },
  ];
  const savedBellOptions: BellInputConfig[] =
    rawBellConfigData === null
      ? defaultBellConfig
      : JSON.parse(rawBellConfigData);

  // 종소리 input 상태
  const [bellInput, setBellInput] = useState<BellInputConfig>(initBellInput);

  // bell의 time(초)은: before => 양수, after => 음수로 변환
  const getInitialBells = (): BellInputConfig[] => {
    if (initData) {
      const initBell = initData.bell === null ? [] : initData.bell;
      return initBell.map(bellConfigToBellInputConfig);
    }
    return savedBellOptions;
  };
  const [bells, setBells] = useState<BellInputConfig[]>(getInitialBells);

  const handleAddBell = () => {
    setBells([
      ...bells,
      {
        type: bellInput.type,
        min: bellInput.min,
        sec: bellInput.sec,
        count: bellInput.count,
      },
    ]);
    setBellInput(initBellInput);
  };

  const handleDeleteBell = (idx: number) => {
    setBells(bells.filter((_, i) => i !== idx));
  };

  const isNormalTimer = timerType === 'NORMAL';

  const speechTypeOptions: DropdownMenuItem<SpeechType>[] = [
    { value: 'OPENING', label: SPEECH_TYPE_RECORD['OPENING'] },
    { value: 'REBUTTAL', label: SPEECH_TYPE_RECORD['REBUTTAL'] },
    { value: 'TIMEOUT', label: SPEECH_TYPE_RECORD['TIMEOUT'] },
    { value: 'CLOSING', label: SPEECH_TYPE_RECORD['CLOSING'] },
    { value: 'CUSTOM', label: SPEECH_TYPE_RECORD['CUSTOM'] },
  ] as const;

  const stanceOptions: DropdownMenuItem<Stance>[] = useMemo(
    () => [
      { value: 'PROS', label: prosTeamName },
      { value: 'CONS', label: consTeamName },
      { value: 'NEUTRAL', label: STANCE_RECORD['NEUTRAL'] },
    ],
    [prosTeamName, consTeamName],
  );

  const bellOptions: DropdownMenuItem<BellType>[] = useMemo(
    () => [
      { value: 'BEFORE_END', label: BellTypeToString['BEFORE_END'] },
      { value: 'AFTER_END', label: BellTypeToString['AFTER_END'] },
      { value: 'AFTER_START', label: BellTypeToString['AFTER_START'] },
    ],
    [],
  );

  const options = isNormalTimer ? NORMAL_OPTIONS : TIME_BASED_OPTIONS;

  const handleSubmit = useCallback(() => {
    const totalTime = minutes * 60 + seconds;
    const totalTimePerTeam = teamMinutes * 60 + teamSeconds;
    const totalTimePerSpeaking = speakerMinutes * 60 + speakerSeconds;

    // 입력 검증 로직
    const errors: string[] = [];

    if (timerType === 'NORMAL') {
      if (totalTime <= 0) {
        errors.push('발언 시간은 1초 이상이어야 해요.');
      }

      // 타종 옵션 유효성 검사
      bells.forEach((item: BellInputConfig) => {
        if (item.type === 'BEFORE_END') {
          const bellTime = item.min * 60 + item.sec;

          if (bellTime > totalTime) {
            errors.push('종료 전 타종은 발언 시간보다 길 수 없어요.');
          }
        }
      });
    }

    if (timerType === 'TIME_BASED') {
      if (totalTimePerTeam <= 0) {
        errors.push('팀당 발언 시간은 1초 이상이어야 해요.');
      }

      if (totalTimePerSpeaking > totalTimePerTeam) {
        errors.push('1회당 발언 시간은 팀당 발언 시간을 초과할 수 없어요.');
      }
    }

    // SpeechType에 맞게 문자열 매핑
    let speechTypeToSend: string;
    let stanceToSend: Stance;
    if (currentSpeechType === 'CUSTOM') {
      // 텍스트 길이 유효성 검사
      if (speechTypeTextValue.length > 10) {
        errors.push('발언 유형은 최대 10자까지 입력할 수 있습니다.');
      }
      if (speaker.length > 5) {
        errors.push('발언자는 최대 5자까지 입력할 수 있습니다.');
      }

      // 발언시간 유효성 검사
      if (
        timerType === 'TIME_BASED' &&
        totalTimePerSpeaking > totalTimePerTeam
      ) {
        errors.push('1회당 발언 시간은 팀당 총 발언 시간보다 클 수 없습니다.');
      }

      // 커스텀 타이머 발언유형 유효성 검사
      if (timerType === 'NORMAL' && speechTypeTextValue.trim() === '') {
        errors.push('발언 유형을 입력해주세요.');
      }
    }

    if (errors.length > 0) {
      alert(errors.join('\n'));
      return;
    } else {
      if (currentSpeechType === 'CUSTOM') {
        speechTypeToSend = speechTypeTextValue;
        stanceToSend = timerType === 'TIME_BASED' ? 'NEUTRAL' : stance;
      } else {
        speechTypeToSend = SPEECH_TYPE_RECORD[currentSpeechType];
        stanceToSend = currentSpeechType === 'TIMEOUT' ? 'NEUTRAL' : stance;
      }
    }

    const bell = isNormalTimer ? bells.map(bellInputConfigToBellConfig) : null;
    if (timerType === 'NORMAL') {
      sessionStorage.setItem(SAVED_BELL_CONFIGS_KEY, JSON.stringify(bells));
      onSubmit({
        stance: stanceToSend,
        speechType: speechTypeToSend,
        boxType: timerType,
        time: totalTime,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: stanceToSend === 'NEUTRAL' ? null : speaker,
        bell,
      });
    } else {
      onSubmit({
        stance: stanceToSend,
        speechType:
          speechTypeToSend.trim() === '' ? '자유토론' : speechTypeToSend,
        boxType: timerType,
        time: null,
        timePerTeam: totalTimePerTeam,
        timePerSpeaking:
          totalTimePerSpeaking !== 0 ? totalTimePerSpeaking : null,
        speaker: null,
        bell: null,
      });
    }

    onClose();
  }, [
    bells,
    isNormalTimer,
    currentSpeechType,
    minutes,
    seconds,
    onClose,
    onSubmit,
    speaker,
    speakerMinutes,
    speakerSeconds,
    teamMinutes,
    teamSeconds,
    stance,
    speechTypeTextValue,
    timerType,
  ]);

  const handleTimerChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const newTimerType = event.target.value as TimeBoxType;
      setTimerType(newTimerType);

      // 타이머 종류에 따라 발언 유형(speechType)을 적절하게 설정
      if (newTimerType === 'NORMAL') {
        setCurrentSpeechType('OPENING'); // 자유토론 > 일반 전환 시 '입론'으로 초기화
        setStance('PROS');
      } else {
        setCurrentSpeechType('CUSTOM'); // 일반 > 자유토론 전환 시 '직접 입력'으로 초기화
        setSpeechTypeTextValue('');
      }
    },
    [],
  );

  const handleSpeechTypeChange = useCallback(
    (selectedValue: SpeechType) => {
      setCurrentSpeechType(selectedValue);

      if (selectedValue === 'CUSTOM') {
        setSpeechTypeTextValue('');
      }

      if (selectedValue === 'TIMEOUT') {
        setStance('NEUTRAL');
        setSpeaker('');
      }

      if (
        stance === 'NEUTRAL' &&
        selectedValue !== 'CUSTOM' &&
        selectedValue !== 'TIMEOUT'
      ) {
        setStance('PROS');
      }
    },
    [stance],
  );

  const handleStanceChange = useCallback(
    (selectedValue: Stance) => {
      if (selectedValue === 'NEUTRAL') {
        if (currentSpeechType !== 'CUSTOM') {
          alert(
            "중립은 발언 유형이 '직접 입력'일 경우에만 선택할 수 있습니다.",
          );
          return;
        }
      }

      setStance(selectedValue);
    },
    [currentSpeechType],
  );

  // 1, 2, 3으로 범위가 제한되는 종소리 횟수에 사용하는 변경 함수
  const handleBellCountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      // Backspace 대응
      if (value === '') {
        setBellInput((prev) => ({
          ...prev,
          count: 1,
        }));
        return;
      }

      // 마지막 입력 문자를 가져옴
      const lastInput = value.slice(-1);
      let newCount;

      if (['1', '2', '3'].includes(lastInput)) {
        // 유효한 입력(1, 2, 3)이면 해당 값으로 설정
        newCount = lastInput;
      } else {
        // 유효하지 않은 문자(알파벳, 1~3 이외 숫자 등)가 마지막에 입력된 경우 무시
        return;
      }

      setBellInput((prev) => ({
        ...prev,
        count: Number(newCount),
      }));
    },
    [],
  );

  // 0 <= x <= 59로 범위가 제한되는 분과 초에 사용하는 검증 함수
  const getValidateTimeValue = (value: string) => {
    let num = parseInt(value, 10);
    if (isNaN(num)) {
      num = 0;
    }

    return Math.max(0, Math.min(59, num));
  };

  return (
    <div className="flex w-[820px] flex-col">
      {/* 헤더 */}
      <section className="mx-[50px] mt-[25px] flex flex-row justify-between">
        {/* 제목 */}
        <span className="flex flex-col space-y-[16px]">
          <h1 className="text-subtitle">
            {timerType === 'NORMAL' ? '일반 타이머' : '자유토론 타이머'}
          </h1>
          <p className="text-body leading-[1.5] text-default-neutral ">
            {timerType === 'NORMAL' ? (
              '한 팀의 발언 시간이 세팅된 일반적인 타이머'
            ) : (
              <>
                {'팀별 발언 시간과 1회당 발언 시간이 세팅된 타이머'}
                <br />
                {'1회당 발언 시간이 지나면, 상대 팀으로 발언권이 넘어감'}
              </>
            )}
          </p>
        </span>

        {/* 닫기 버튼 */}
        <button onClick={onClose}>
          <DTClose className="size-8 text-default-black" />
        </button>
      </section>

      {/* 디바이더 */}
      <span className="mx-[50px] mt-[20px] h-[1px] bg-default-neutral"></span>

      {/* 입력 폼 */}
      <section className="mx-[50px] my-[30px] flex flex-1 flex-row">
        {/* 타이머 사진 */}
        <span className="relative flex w-[250px] items-center justify-center">
          {isNormalTimer ? (
            <img
              src={
                stance === 'NEUTRAL'
                  ? normalTimerNeutralImage
                  : stance === 'PROS'
                    ? normalTimerProsImage
                    : normalTimerConsImage
              }
              alt="normal-timer"
              className="absolute top-1/3 w-full -translate-y-1/2 object-contain"
            />
          ) : (
            <img
              src={timeBasedPreviewSrc}
              alt={timeBasedPreviewAlt}
              className="absolute top-1/2 w-full -translate-y-1/2 object-contain"
            />
          )}
        </span>

        {/* 여백 */}
        <span className="w-[40px]"></span>

        {/* 옵션 */}
        <span className="flex w-full flex-1 flex-col space-y-[16px]">
          {options.map((timerType, index) => {
            switch (timerType) {
              // 타이머 종류
              case 'TIMER_TYPE':
                return (
                  <TimerCreationContentItem
                    title="종류"
                    key={`${timerType}-${index}`}
                  >
                    <span className="flex w-full flex-row space-x-[16px]">
                      <LabeledRadioButton
                        id="timer-type-normal"
                        name="timer-type"
                        value="NORMAL"
                        label="일반 타이머"
                        checked={isNormalTimer}
                        onChange={handleTimerChange}
                      />
                      <LabeledRadioButton
                        id="timer-type-time-based"
                        name="timer-type"
                        value="TIME_BASED"
                        label="자유토론 타이머"
                        checked={!isNormalTimer}
                        onChange={handleTimerChange}
                      />
                    </span>
                  </TimerCreationContentItem>
                );

              // 발언자
              case 'SPEAKER':
                return (
                  <TimerCreationContentItem
                    title="발언자"
                    key={`${timerType}-${index}`}
                  >
                    <ClearableInput
                      id="speaker"
                      value={speaker}
                      onChange={(e) => setSpeaker(e.target.value)}
                      onClear={() => setSpeaker('')}
                      placeholder="N번 토론자"
                      disabled={
                        stance === 'NEUTRAL' || currentSpeechType === 'TIMEOUT'
                      }
                    />
                  </TimerCreationContentItem>
                );

              // 발언 시간 (일반 타이머)
              case 'TIME_NORMAL':
                return (
                  <TimeInputGroup
                    title={`발언 시간`}
                    key={`${timerType}-${index}`}
                    minutes={minutes}
                    seconds={seconds}
                    onMinutesChange={setMinutes}
                    onSecondsChange={setSeconds}
                  />
                );

              // 1회당 발언 시간 (시간 총량제 타이머)
              case 'TIME_PER_SPEAKING':
                return (
                  <TimeInputGroup
                    title={`1회당\n발언 시간`}
                    key={`${timerType}-${index}`}
                    minutes={speakerMinutes}
                    seconds={speakerSeconds}
                    onMinutesChange={setSpeakerMinutes}
                    onSecondsChange={setSpeakerSeconds}
                  />
                );

              // 팀당 발언 시간 (시간 총량제 타이머)
              case 'TIME_PER_TEAM':
                return (
                  <TimeInputGroup
                    title={`팀당\n발언 시간`}
                    key={`${timerType}-${index}`}
                    minutes={teamMinutes}
                    seconds={teamSeconds}
                    onMinutesChange={setTeamMinutes}
                    onSecondsChange={setTeamSeconds}
                  />
                );

              // 발언 유형 (시간 총량제 타이머)
              case 'SPEECH_TYPE_TIME_BASED':
                return (
                  <TimerCreationContentItem
                    title="발언 유형"
                    key={`${timerType}-${index}`}
                  >
                    <ClearableInput
                      id="speech-type-time-based"
                      value={speechTypeTextValue}
                      onChange={(e) => setSpeechTypeTextValue(e.target.value)}
                      onClear={() => setSpeechTypeTextValue('')}
                      placeholder="주도권 토론 등"
                    />
                  </TimerCreationContentItem>
                );

              // 발언 유형 (일반 타이머)
              case 'SPEECH_TYPE_NORMAL':
                return (
                  <TimerCreationContentItem
                    title="발언 유형"
                    key={`${timerType}-${index}`}
                  >
                    <span className="flex flex-row items-center space-x-[16px]">
                      <DropdownMenu
                        className={clsx({
                          'w-full': currentSpeechType !== 'CUSTOM',
                        })}
                        options={speechTypeOptions}
                        selectedValue={currentSpeechType}
                        onSelect={handleSpeechTypeChange}
                        placeholder="선택"
                      />

                      {currentSpeechType === 'CUSTOM' && (
                        <ClearableInput
                          id="speech-type-normal"
                          value={speechTypeTextValue}
                          onChange={(e) =>
                            setSpeechTypeTextValue(e.target.value)
                          }
                          onClear={() => setSpeechTypeTextValue('')}
                          placeholder="입론, 반론, 작전 시간 등"
                        />
                      )}
                    </span>
                  </TimerCreationContentItem>
                );

              // 팀
              case 'TEAM':
                return (
                  <TimerCreationContentItem
                    title="팀"
                    key={`${timerType}-${index}`}
                  >
                    <DropdownMenu
                      className="w-full"
                      options={stanceOptions}
                      selectedValue={stance}
                      onSelect={handleStanceChange}
                      disabled={currentSpeechType === 'TIMEOUT'}
                    />
                  </TimerCreationContentItem>
                );

              case 'BELL':
                return (
                  <div
                    className="flex w-full flex-col space-y-[16px]"
                    key={`${timerType}-${index}`}
                  >
                    {/* 제목 */}
                    <p className="text-body w-[80px] font-medium">
                      종소리 설정
                    </p>

                    {/* 입력부 */}
                    <span className="flex w-full flex-row items-center space-x-[4px]">
                      {/* 벨 유형 */}
                      <DropdownMenu
                        className=""
                        options={bellOptions}
                        selectedValue={bellInput.type}
                        onSelect={(value: BellType) => {
                          setBellInput((prev) => ({
                            ...prev,
                            type: value,
                          }));
                        }}
                      />
                      <span className="w-[8px]"></span>

                      {/* 분, 초, 타종 횟수 */}
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-[60px] rounded-[4px] border border-default-border p-[8px]"
                        value={bellInput.min}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const safeValue = e.target.value.replace(
                            /[^0-9]/g,
                            '',
                          );

                          setBellInput((prev) => ({
                            ...prev,
                            min: getValidateTimeValue(safeValue),
                          }));
                        }}
                        placeholder="분"
                      />
                      <span>분</span>

                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        className="w-[60px] rounded-[4px] border border-default-border p-[8px]"
                        value={bellInput.sec}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                          const safeValue = e.target.value.replace(
                            /[^0-9]/g,
                            '',
                          );

                          setBellInput((prev) => ({
                            ...prev,
                            sec: getValidateTimeValue(safeValue),
                          }));
                        }}
                        placeholder="초"
                      />
                      <span>초</span>
                      <span className="w-[8px]"></span>

                      <DTBell className="w-[24px]" />
                      <p>x</p>
                      <input
                        type="text"
                        inputMode="numeric"
                        className="w-[60px] rounded-[4px] border border-default-border p-[8px]"
                        value={bellInput.count}
                        onChange={handleBellCountChange}
                        placeholder="횟수"
                      />
                      <span className="w-[8px]"></span>

                      <button
                        type="button"
                        className="flex size-[28px] items-center justify-center rounded-[8px] bg-default-disabled/hover p-[6px] text-default-white"
                        onClick={handleAddBell}
                      >
                        <DTAdd />
                      </button>
                    </span>

                    {/* 벨 리스트 */}
                    <span className="flex h-[100px] w-full flex-col items-center gap-2 overflow-y-auto">
                      {bells.map((bell, idx) => (
                        <span
                          key={idx}
                          className="relative flex w-full flex-row rounded-[4px] border border-default-border bg-[#FFF2D0] px-[12px] py-[4px]"
                        >
                          <div className="flex items-center gap-1">
                            <p className="text-[14px]">
                              {BellTypeToString[bell.type]}
                            </p>
                            <p className="text-[14px]">
                              {bell.min}분 {bell.sec}초
                            </p>

                            <span className="w-[8px]"></span>
                            <DTBell className="size-[14px]" />
                            <span className="text-[14px]">x {bell.count}</span>
                          </div>

                          <button
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-default-border"
                            onClick={() => handleDeleteBell(idx)}
                          >
                            <DTClose className="size-[10px]" />
                          </button>
                        </span>
                      ))}
                    </span>
                  </div>
                );
              default:
                return null;
            }
          })}
        </span>
      </section>

      {/* 제출 버튼 */}
      <button className="button enabled brand" onClick={handleSubmit}>
        설정 완료
      </button>
    </div>
  );
}

function bellInputConfigToBellConfig(input: BellInputConfig): BellConfig {
  let time = input.min * 60 + input.sec;
  if (input.type === 'AFTER_END') time = -time;
  return {
    time,
    count: input.count,
    type: input.type,
  };
}

function bellConfigToBellInputConfig(data: BellConfig): BellInputConfig {
  const { type, time, count } = data;
  const { minutes, seconds } = Formatting.formatSecondsToMinutes(time);
  const converted = { type, min: minutes, sec: seconds, count };
  return converted;
}
