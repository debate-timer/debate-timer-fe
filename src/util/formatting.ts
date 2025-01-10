import { Stance, DebateType } from '../type/type';

export const Formatting = {
  formatSecondsToMinutes: (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return { minutes, seconds };
  },

  formatStanceToString: (stance: Stance) => {
    switch (stance) {
      case 'PROS':
        return '찬성';
      case 'CONS':
        return '반대';
      default:
        return '중립';
    }
  },

  formatDebateTypeToString: (debateType: DebateType) => {
    switch (debateType) {
      case 'OPENING':
        return '입론';
      case 'REBUTTAL':
        return '반론';
      case 'CROSS':
        return '교차 질의';
      case 'CLOSING':
        return '최종 발언';
      case 'TIME_OUT':
        return '작전 시간';
      default:
        return 'UNDEFINED';
    }
  },
};
