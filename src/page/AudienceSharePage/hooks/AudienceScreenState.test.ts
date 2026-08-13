import { describe, it, expect } from 'vitest';
import {
  isValidNormalTimeBox,
  isValidTimeBasedTimeBox,
  getNormalTimerTeamName,
  resolveAudienceScreenState,
  AudienceQueryState,
} from './AudienceScreenState';
import { AudienceShareError } from '../error';
import { DebateInfo, DebateTableData, TimeBoxInfo } from '../../../type/type';
import { AudienceShareState } from './useAudienceShareState';

const t = (key: string) => key;

const mockDebateInfo: DebateInfo = {
  name: '테스트 토론방',
  agenda: '테스트 주제',
  prosTeamName: '찬성팀',
  consTeamName: '반대팀',
};

const mockNormalTimeBox: TimeBoxInfo = {
  stance: 'PROS',
  speechType: '입론',
  bell: null,
  boxType: 'NORMAL',
  time: 180,
  timePerTeam: null,
  timePerSpeaking: null,
  speaker: '찬성 1',
};

const mockTimeBasedTimeBox: TimeBoxInfo = {
  stance: 'NEUTRAL',
  speechType: '자유토론',
  bell: null,
  boxType: 'TIME_BASED',
  time: null,
  timePerTeam: 600,
  timePerSpeaking: 120,
  speaker: null,
};

const mockTableData: DebateTableData = {
  info: mockDebateInfo,
  table: [mockNormalTimeBox, mockTimeBasedTimeBox],
};

describe('audienceScreenState', () => {
  describe('isValidNormalTimeBox', () => {
    it('유효한 일반 타이머 timeBox인 경우 true를 반환한다', () => {
      expect(isValidNormalTimeBox(mockNormalTimeBox)).toBe(true);
    });

    it('timeBox가 undefined인 경우 false를 반환한다', () => {
      expect(isValidNormalTimeBox(undefined)).toBe(false);
    });

    it('boxType이 NORMAL이 아닌 경우 false를 반환한다', () => {
      expect(isValidNormalTimeBox(mockTimeBasedTimeBox)).toBe(false);
    });

    it('time이 null인 경우 false를 반환한다', () => {
      const invalidTimeBox: TimeBoxInfo = {
        ...mockNormalTimeBox,
        time: null,
      };
      expect(isValidNormalTimeBox(invalidTimeBox)).toBe(false);
    });

    it('time이 0 이하인 경우 false를 반환한다', () => {
      const invalidTimeBox: TimeBoxInfo = {
        ...mockNormalTimeBox,
        time: 0,
      };
      expect(isValidNormalTimeBox(invalidTimeBox)).toBe(false);
    });
  });

  describe('isValidTimeBasedTimeBox', () => {
    it('유효한 자유토론 타이머 timeBox인 경우 true를 반환한다', () => {
      expect(isValidTimeBasedTimeBox(mockTimeBasedTimeBox)).toBe(true);
    });

    it('timePerSpeaking이 null인 경우에도 유효하면 true를 반환한다', () => {
      const validTimeBox: TimeBoxInfo = {
        ...mockTimeBasedTimeBox,
        timePerSpeaking: null,
      };
      expect(isValidTimeBasedTimeBox(validTimeBox)).toBe(true);
    });

    it('timeBox가 undefined인 경우 false를 반환한다', () => {
      expect(isValidTimeBasedTimeBox(undefined)).toBe(false);
    });

    it('boxType이 TIME_BASED가 아닌 경우 false를 반환한다', () => {
      expect(isValidTimeBasedTimeBox(mockNormalTimeBox)).toBe(false);
    });

    it('timePerTeam이 null이거나 0 이하인 경우 false를 반환한다', () => {
      const invalidTimeBox1: TimeBoxInfo = {
        ...mockTimeBasedTimeBox,
        timePerTeam: null,
      };
      const invalidTimeBox2: TimeBoxInfo = {
        ...mockTimeBasedTimeBox,
        timePerTeam: 0,
      };
      expect(isValidTimeBasedTimeBox(invalidTimeBox1)).toBe(false);
      expect(isValidTimeBasedTimeBox(invalidTimeBox2)).toBe(false);
    });

    it('timePerSpeaking이 0 이하인 경우 false를 반환한다', () => {
      const invalidTimeBox: TimeBoxInfo = {
        ...mockTimeBasedTimeBox,
        timePerSpeaking: 0,
      };
      expect(isValidTimeBasedTimeBox(invalidTimeBox)).toBe(false);
    });
  });

  describe('getNormalTimerTeamName', () => {
    it('stance가 PROS일 경우 찬성 팀명을 반환한다', () => {
      expect(getNormalTimerTeamName('PROS', mockDebateInfo)).toBe('찬성팀');
    });

    it('stance가 CONS일 경우 반대 팀명을 반환한다', () => {
      expect(getNormalTimerTeamName('CONS', mockDebateInfo)).toBe('반대팀');
    });

    it('stance가 NEUTRAL일 경우 빈 문자열을 반환한다', () => {
      expect(getNormalTimerTeamName('NEUTRAL', mockDebateInfo)).toBe('');
    });
  });

  describe('resolveAudienceScreenState', () => {
    const successQueryState: AudienceQueryState = {
      data: mockTableData,
      isLoading: false,
      isError: false,
    };

    it('소켓 에러가 발생하면 ERROR 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'connecting',
        error: new AudienceShareError('UNKNOWN'),
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'ERROR',
        message: '서버 연결에 실패했어요.',
      });
    });

    it('쿼리 에러가 발생하면 ERROR 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'connecting',
        error: null,
      };
      const queryState: AudienceQueryState = {
        data: undefined,
        isLoading: false,
        isError: true,
      };
      const result = resolveAudienceScreenState(socketState, queryState, t);
      expect(result).toEqual({
        type: 'ERROR',
        message: '필요한 데이터를 불러오지 못했어요. 다시 시도해보세요.',
      });
    });

    it('쿼리가 로딩 중이면 LOADING 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'connecting',
        error: null,
      };
      const queryState: AudienceQueryState = {
        data: undefined,
        isLoading: true,
        isError: false,
      };
      const result = resolveAudienceScreenState(socketState, queryState, t);
      expect(result).toEqual({ type: 'LOADING' });
    });

    it('소켓이 connecting 상태이면 LOADING 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'connecting',
        error: null,
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({ type: 'LOADING' });
    });

    it('소켓이 waiting 상태이면 WAITING 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'waiting',
        error: null,
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'WAITING',
        message: '토론 시작을 대기 중입니다.',
      });
    });

    it('소켓이 finished 상태이면 FINISHED 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'finished',
        error: null,
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'FINISHED',
        message: '토론이 종료되었습니다.',
      });
    });

    it('displaying 상태에서 일반 타이머 유효시 NORMAL_TIMER 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: true,
          singleTime: 120,
          sequence: 0,
        },
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'NORMAL_TIMER',
        timeBox: mockNormalTimeBox,
        displayData: socketState.displayData,
        teamName: '찬성팀',
        debateInfo: mockDebateInfo,
      });
    });

    it('displaying 상태에서 일반 타이머가 유효하지 않으면 CONFIG_ERROR 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: true,
          singleTime: 120,
          sequence: 1, // 1번은 TIME_BASED timeBox라 NORMAL에 유효하지 않음
        },
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'CONFIG_ERROR',
        message: '시간표 설정에 오류가 발생했어요.',
      });
    });

    it('displaying 상태에서 자유토론 타이머 유효시 TIME_BASED_TIMER 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: true,
          prosTime: 500,
          consTime: 600,
          sequence: 1,
          eventType: 'PLAY',
          revision: 1,
        },
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'TIME_BASED_TIMER',
        timeBox: mockTimeBasedTimeBox,
        displayData: socketState.displayData,
        prosTeamName: '찬성팀',
        consTeamName: '반대팀',
        debateInfo: mockDebateInfo,
      });
    });

    it('displaying 상태에서 자유토론 타이머가 유효하지 않으면 CONFIG_ERROR 상태를 반환한다', () => {
      const socketState: AudienceShareState = {
        status: 'displaying',
        error: null,
        displayData: {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: true,
          prosTime: 500,
          consTime: 600,
          sequence: 0, // 0번은 NORMAL timeBox라 TIME_BASED에 유효하지 않음
          eventType: 'PLAY',
          revision: 1,
        },
      };
      const result = resolveAudienceScreenState(
        socketState,
        successQueryState,
        t,
      );
      expect(result).toEqual({
        type: 'CONFIG_ERROR',
        message: '시간표 설정에 오류가 발생했어요.',
      });
    });
  });
});
