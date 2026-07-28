import { DebateInfo, DebateTableData, TimeBoxInfo } from '../../../type/type';
import {
  AudienceNormalDisplayData,
  AudienceShareState,
  AudienceTimeBasedDisplayData,
} from '../hooks/useAudienceShareState';

export type ValidNormalTimeBox = TimeBoxInfo & {
  boxType: 'NORMAL';
  time: number;
};

export type ValidTimeBasedTimeBox = TimeBoxInfo & {
  boxType: 'TIME_BASED';
  timePerTeam: number;
  timePerSpeaking: number | null;
};

export function isValidNormalTimeBox(
  timeBox: TimeBoxInfo | undefined,
): timeBox is ValidNormalTimeBox {
  return (
    timeBox?.boxType === 'NORMAL' && timeBox.time !== null && timeBox.time > 0
  );
}

export function isValidTimeBasedTimeBox(
  timeBox: TimeBoxInfo | undefined,
): timeBox is ValidTimeBasedTimeBox {
  return (
    timeBox?.boxType === 'TIME_BASED' &&
    timeBox.timePerTeam !== null &&
    timeBox.timePerTeam > 0 &&
    (timeBox.timePerSpeaking === null || timeBox.timePerSpeaking > 0)
  );
}

export function getNormalTimerTeamName(
  stance: TimeBoxInfo['stance'],
  info: DebateInfo,
): string {
  if (stance === 'PROS') {
    return info.prosTeamName;
  }

  if (stance === 'CONS') {
    return info.consTeamName;
  }

  return '';
}

export type AudienceViewState =
  | {
      type: 'LOADING';
    }
  | {
      type: 'WAITING';
      message: string;
    }
  | {
      type: 'NORMAL_TIMER';
      timeBox: ValidNormalTimeBox;
      displayData: AudienceNormalDisplayData;
      teamName: string;
      debateInfo: DebateInfo;
    }
  | {
      type: 'TIME_BASED_TIMER';
      timeBox: ValidTimeBasedTimeBox;
      displayData: AudienceTimeBasedDisplayData;
      prosTeamName: string;
      consTeamName: string;
      debateInfo: DebateInfo;
    }
  | {
      type: 'FINISHED';
      message: string;
    }
  | {
      type: 'ERROR';
      message: string;
    }
  | {
      type: 'CONFIG_ERROR';
      message: string;
    };

export interface AudienceQueryState {
  data?: DebateTableData;
  isLoading: boolean;
  isError: boolean;
}

export type TranslateFn = (key: string) => string;

export function resolveAudienceScreenState(
  state: AudienceShareState,
  queryState: AudienceQueryState,
  t: TranslateFn,
): AudienceViewState {
  if (state.error) {
    return {
      type: 'ERROR',
      message: t('서버 연결에 실패했어요.'),
    };
  }

  if (queryState.isError) {
    return {
      type: 'ERROR',
      message: t('필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.'),
    };
  }

  if (
    queryState.isLoading ||
    !queryState.data ||
    state.status === 'connecting'
  ) {
    return {
      type: 'LOADING',
    };
  }

  if (state.status === 'waiting') {
    return {
      type: 'WAITING',
      message: t('토론 시작을 대기 중입니다.'),
    };
  }

  if (state.status === 'finished') {
    return {
      type: 'FINISHED',
      message: t('토론이 종료되었습니다.'),
    };
  }

  if (state.status === 'displaying') {
    const { displayData } = state;
    const timeBox = queryState.data.table[displayData.sequence];

    if (displayData.timerType === 'NORMAL') {
      if (!isValidNormalTimeBox(timeBox)) {
        return {
          type: 'CONFIG_ERROR',
          message: t('시간표 설정에 오류가 발생했어요.'),
        };
      }

      return {
        type: 'NORMAL_TIMER',
        timeBox,
        displayData,
        teamName: getNormalTimerTeamName(timeBox.stance, queryState.data.info),
        debateInfo: queryState.data.info,
      };
    }

    if (displayData.timerType === 'TIME_BASED') {
      if (!isValidTimeBasedTimeBox(timeBox)) {
        return {
          type: 'CONFIG_ERROR',
          message: t('시간표 설정에 오류가 발생했어요.'),
        };
      }

      return {
        type: 'TIME_BASED_TIMER',
        timeBox,
        displayData,
        prosTeamName: queryState.data.info.prosTeamName,
        consTeamName: queryState.data.info.consTeamName,
        debateInfo: queryState.data.info,
      };
    }
  }

  return {
    type: 'LOADING',
  };
}
