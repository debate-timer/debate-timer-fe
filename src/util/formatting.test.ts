import { describe, expect, it } from 'vitest';
import { Formatting } from './formatting';

describe('Formatting 포맷 유틸리티', () => {
  describe('formatSecondsToMMSS 초 단위 시간 포맷 함수', () => {
    it('0초를 00:00으로 포맷한다', () => {
      expect(Formatting.formatSecondsToMMSS(0)).toBe('00:00');
    });

    it('5초를 00:05로 포맷한다', () => {
      expect(Formatting.formatSecondsToMMSS(5)).toBe('00:05');
    });

    it('65초를 01:05로 포맷한다', () => {
      expect(Formatting.formatSecondsToMMSS(65)).toBe('01:05');
    });

    it('음수 입력값을 0으로 보정한다', () => {
      expect(Formatting.formatSecondsToMMSS(-10)).toBe('00:00');
    });

    it('600초를 10:00으로 포맷한다', () => {
      expect(Formatting.formatSecondsToMMSS(600)).toBe('10:00');
    });
  });
});
