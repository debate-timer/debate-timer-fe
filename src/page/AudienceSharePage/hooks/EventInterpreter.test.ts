import { describe, it, expect } from 'vitest';
import {
  getNextTeam,
  getNormalTotalTime,
  createDisplayData,
  createNavigationDisplayData,
  getDisplayDataByEvent,
  AudienceNormalDisplayData,
  AudienceTimeBasedDisplayData,
} from './EventInterpreter';
import { TimeBoxInfo } from '../../../type/type';
import { TimerDataPayload } from '../../../apis/sockets/type';

describe('eventInterpreter 순수 함수', () => {
  describe('getNextTeam', () => {
    it('PROS 입력 시 CONS를 반환한다', () => {
      expect(getNextTeam('PROS')).toBe('CONS');
    });

    it('CONS 입력 시 PROS를 반환한다', () => {
      expect(getNextTeam('CONS')).toBe('PROS');
    });
  });

  describe('getNormalTotalTime', () => {
    const mockTable: TimeBoxInfo[] = [
      {
        stance: 'NEUTRAL',
        speechType: '입론',
        bell: null,
        boxType: 'NORMAL',
        time: 180,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: null,
      },
      {
        stance: 'NEUTRAL',
        speechType: '자유토론',
        bell: null,
        boxType: 'TIME_BASED',
        time: null,
        timePerTeam: 300,
        timePerSpeaking: 60,
        speaker: null,
      },
    ];

    it('table에 NORMAL 타입의 유효한 time이 있으면 그 값을 반환한다', () => {
      expect(getNormalTotalTime(mockTable, 0, 100)).toBe(180);
    });

    it('table이 undefined이면 fallbackTime을 반환한다', () => {
      expect(getNormalTotalTime(undefined, 0, 100)).toBe(100);
    });

    it('해당 index의 boxType이 TIME_BASED이면 fallbackTime을 반환한다', () => {
      expect(getNormalTotalTime(mockTable, 1, 100)).toBe(100);
    });

    it('time이 null 또는 0 이하이면 fallbackTime을 반환한다', () => {
      const invalidTable: TimeBoxInfo[] = [
        {
          stance: 'NEUTRAL',
          speechType: '입론',
          bell: null,
          boxType: 'NORMAL',
          time: 0,
          timePerTeam: null,
          timePerSpeaking: null,
          speaker: null,
        },
      ];
      expect(getNormalTotalTime(invalidTable, 0, 100)).toBe(100);
    });
  });

  describe('createDisplayData', () => {
    it('NORMAL 타이머 데이터인 경우 AudienceNormalDisplayData를 반환한다', () => {
      const payload: TimerDataPayload = {
        timerType: 'NORMAL',
        remainingTime: 120,
        sequence: 0,
      };
      const result = createDisplayData(payload, null, {
        eventType: 'PLAY',
        isRunning: true,
      });

      expect(result).toEqual({
        timerType: 'NORMAL',
        currentTeam: null,
        isRunning: true,
        singleTime: 120,
        sequence: 0,
      });
    });

    it('TIME_BASED 타이머 데이터에서 currentTeam이 유효하지 않으면 이전 displayData를 반환한다', () => {
      const payload: TimerDataPayload = {
        timerType: 'TIME_BASED',
        remainingTime: 120,
        sequence: 1,
        currentTeam: undefined,
      };
      const prevData: AudienceNormalDisplayData = {
        timerType: 'NORMAL',
        currentTeam: null,
        isRunning: false,
        singleTime: 100,
        sequence: 0,
      };

      const result = createDisplayData(payload, prevData, {
        eventType: 'PLAY',
        isRunning: true,
      });

      expect(result).toBe(prevData);
    });

    it('TIME_BASED 타이머 데이터 수신 시 currentTeam 시간에 맞게 갱신한다 (PROS)', () => {
      const payload: TimerDataPayload = {
        timerType: 'TIME_BASED',
        remainingTime: 150,
        sequence: 1,
        currentTeam: 'PROS',
      };
      const prevData: AudienceTimeBasedDisplayData = {
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        isRunning: false,
        prosTime: 180,
        consTime: 180,
        sequence: 1,
        eventType: 'STOP',
        revision: 1,
      };

      const result = createDisplayData(payload, prevData, {
        eventType: 'PLAY',
        isRunning: true,
      });

      expect(result).toEqual({
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        isRunning: true,
        prosTime: 150,
        consTime: 180,
        sequence: 1,
        eventType: 'PLAY',
        revision: 2,
      });
    });

    it('shouldSwitchTeam 옵션이 true이면 발언 팀을 변경한다', () => {
      const payload: TimerDataPayload = {
        timerType: 'TIME_BASED',
        remainingTime: 150,
        sequence: 1,
        currentTeam: 'PROS',
      };
      const prevData: AudienceTimeBasedDisplayData = {
        timerType: 'TIME_BASED',
        currentTeam: 'PROS',
        isRunning: true,
        prosTime: 180,
        consTime: 180,
        sequence: 1,
        eventType: 'PLAY',
        revision: 1,
      };

      const result = createDisplayData(payload, prevData, {
        eventType: 'TEAM_SWITCH',
        isRunning: true,
        shouldSwitchTeam: true,
      });

      expect(result?.timerType === 'TIME_BASED' && result.currentTeam).toBe(
        'CONS',
      );
    });
  });

  describe('createNavigationDisplayData', () => {
    const mockTable: TimeBoxInfo[] = [
      {
        stance: 'NEUTRAL',
        speechType: '입론',
        bell: null,
        boxType: 'NORMAL',
        time: 180,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: null,
      },
      {
        stance: 'NEUTRAL',
        speechType: '자유토론',
        bell: null,
        boxType: 'TIME_BASED',
        time: null,
        timePerTeam: 300,
        timePerSpeaking: 60,
        speaker: null,
      },
    ];

    it('목표 sequence가 NORMAL 타입인 경우 전달된 table 정보로 NORMAL 데이터를 생성한다', () => {
      const payload: TimerDataPayload = {
        timerType: 'NORMAL',
        remainingTime: 180,
        sequence: 1,
      };

      const result = createNavigationDisplayData(
        'BEFORE',
        payload,
        null,
        mockTable,
        0,
      );

      expect(result).toEqual({
        timerType: 'NORMAL',
        currentTeam: null,
        isRunning: false,
        singleTime: 180,
        sequence: 0,
      });
    });

    it('목표 sequence가 TIME_BASED 타입인 경우 전달된 table 정보로 TIME_BASED 데이터를 생성한다', () => {
      const payload: TimerDataPayload = {
        timerType: 'TIME_BASED',
        remainingTime: 300,
        sequence: 0,
        currentTeam: 'CONS',
      };

      const result = createNavigationDisplayData(
        'NEXT',
        payload,
        null,
        mockTable,
        1,
      );

      expect(result).toEqual({
        timerType: 'TIME_BASED',
        currentTeam: 'CONS',
        isRunning: false,
        prosTime: null,
        consTime: 60,
        sequence: 1,
        eventType: 'NEXT',
        revision: 1,
      });
    });

    it('목표 sequence가 table 범위를 벗어나거나 조건에 안 맞으면 null을 반환한다', () => {
      const payload: TimerDataPayload = {
        timerType: 'NORMAL',
        remainingTime: 180,
        sequence: 0,
      };

      const result = createNavigationDisplayData(
        'NEXT',
        payload,
        null,
        mockTable,
        99,
      );

      expect(result).toBeNull();
    });
  });

  describe('getDisplayDataByEvent', () => {
    const mockTable: TimeBoxInfo[] = [
      {
        stance: 'NEUTRAL',
        speechType: '입론 1',
        bell: null,
        boxType: 'NORMAL',
        time: 180,
        timePerTeam: null,
        timePerSpeaking: null,
        speaker: null,
      },
      {
        stance: 'NEUTRAL',
        speechType: '자유토론',
        bell: null,
        boxType: 'TIME_BASED',
        time: null,
        timePerTeam: 300,
        timePerSpeaking: 60,
        speaker: null,
      },
    ];

    describe('PLAY 이벤트', () => {
      it('타이머 실행 상태(isRunning: true)로 데이터를 반환한다', () => {
        const payload: TimerDataPayload = {
          timerType: 'NORMAL',
          remainingTime: 175,
          sequence: 0,
        };

        const result = getDisplayDataByEvent('PLAY', payload, null, mockTable);
        expect(result).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: true,
          singleTime: 175,
          sequence: 0,
        });
      });
    });

    describe('STOP 이벤트', () => {
      it('타이머 정지 상태(isRunning: false)로 데이터를 반환한다', () => {
        const payload: TimerDataPayload = {
          timerType: 'NORMAL',
          remainingTime: 120,
          sequence: 0,
        };

        const result = getDisplayDataByEvent('STOP', payload, null, mockTable);
        expect(result).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 120,
          sequence: 0,
        });
      });
    });

    describe('RESET 이벤트', () => {
      it('table에서 해당 sequence의 총 시간을 가져와 초기화한다', () => {
        const payload: TimerDataPayload = {
          timerType: 'NORMAL',
          remainingTime: 50,
          sequence: 0,
        };

        const result = getDisplayDataByEvent('RESET', payload, null, mockTable);
        expect(result).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 180,
          sequence: 0,
        });
      });
    });

    describe('BEFORE 이벤트', () => {
      it('이전 sequence(data.sequence - 1)로 이동한 데이터를 반환한다', () => {
        const payload: TimerDataPayload = {
          timerType: 'TIME_BASED',
          remainingTime: 300,
          sequence: 1,
          currentTeam: 'PROS',
        };

        const result = getDisplayDataByEvent(
          'BEFORE',
          payload,
          null,
          mockTable,
        );
        expect(result).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 180,
          sequence: 0,
        });
      });

      it('첫 sequence(0)에서는 0으로 고정되어 범위를 벗어나지 않는다', () => {
        const payload: TimerDataPayload = {
          timerType: 'NORMAL',
          remainingTime: 100,
          sequence: 0,
        };

        const result = getDisplayDataByEvent(
          'BEFORE',
          payload,
          null,
          mockTable,
        );
        expect(result).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 180,
          sequence: 0,
        });
      });
    });

    describe('NEXT 이벤트', () => {
      it('다음 sequence(data.sequence + 1)로 이동한 데이터를 반환한다', () => {
        const payload: TimerDataPayload = {
          timerType: 'NORMAL',
          remainingTime: 0,
          sequence: 0,
          currentTeam: 'PROS',
        };

        const result = getDisplayDataByEvent('NEXT', payload, null, mockTable);
        expect(result).toEqual({
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: false,
          prosTime: 60,
          consTime: null,
          sequence: 1,
          eventType: 'NEXT',
          revision: 1,
        });
      });

      it('마지막 sequence(table.length - 1)에서는 더 넘어가지 않고 고정된다', () => {
        const payload: TimerDataPayload = {
          timerType: 'TIME_BASED',
          remainingTime: 60,
          sequence: mockTable.length - 1,
          currentTeam: 'PROS',
        };

        const result = getDisplayDataByEvent('NEXT', payload, null, mockTable);
        expect(result).toEqual({
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: false,
          prosTime: 60,
          consTime: null,
          sequence: mockTable.length - 1,
          eventType: 'NEXT',
          revision: 1,
        });
      });

      it('빈 table에서는 sequence가 음수가 되지 않는다', () => {
        const payload: TimerDataPayload = {
          timerType: 'NORMAL',
          remainingTime: 30,
          sequence: 0,
          currentTeam: 'PROS',
        };

        const result = getDisplayDataByEvent('NEXT', payload, null, []);

        expect(result?.sequence).toBeGreaterThanOrEqual(0);
        expect(result).toEqual({
          timerType: 'NORMAL',
          currentTeam: null,
          isRunning: false,
          singleTime: 30,
          sequence: 0,
        });
      });
    });

    describe('TEAM_SWITCH 이벤트', () => {
      it('팀을 교체하고 이전 isRunning 상태를 유지한다', () => {
        const payload: TimerDataPayload = {
          timerType: 'TIME_BASED',
          remainingTime: 50,
          sequence: 1,
          currentTeam: 'PROS',
        };

        const prevData: AudienceTimeBasedDisplayData = {
          timerType: 'TIME_BASED',
          currentTeam: 'PROS',
          isRunning: true,
          prosTime: 50,
          consTime: 60,
          sequence: 1,
          eventType: 'PLAY',
          revision: 2,
        };

        const result = getDisplayDataByEvent(
          'TEAM_SWITCH',
          payload,
          prevData,
          mockTable,
        );

        expect(result).toEqual({
          timerType: 'TIME_BASED',
          currentTeam: 'CONS',
          isRunning: true,
          prosTime: 50,
          consTime: 60,
          sequence: 1,
          eventType: 'TEAM_SWITCH',
          revision: 3,
        });
      });
    });
  });
});
