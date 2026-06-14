import { describe, expect, it } from 'vitest';
import { Formatting } from './formatting';

describe('Formatting', () => {
  describe('formatSecondsToMMSS', () => {
    it('formats 0 seconds to 00:00', () => {
      expect(Formatting.formatSecondsToMMSS(0)).toBe('00:00');
    });

    it('formats 5 seconds to 00:05', () => {
      expect(Formatting.formatSecondsToMMSS(5)).toBe('00:05');
    });

    it('formats 65 seconds to 01:05', () => {
      expect(Formatting.formatSecondsToMMSS(65)).toBe('01:05');
    });

    it('clamps negative inputs to 0', () => {
      expect(Formatting.formatSecondsToMMSS(-10)).toBe('00:00');
    });

    it('formats 600 seconds to 10:00', () => {
      expect(Formatting.formatSecondsToMMSS(600)).toBe('10:00');
    });
  });
});
