import { describe, expect, it } from 'vitest';
import { getJwtExpiresAt } from './jwt';

function createToken(payload: object) {
  const encode = (value: object) =>
    btoa(JSON.stringify(value))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  return `${encode({ alg: 'HS256' })}.${encode(payload)}.signature`;
}

describe('getJwtExpiresAt', () => {
  it('exp(초)를 epoch ms로 반환한다', () => {
    expect(getJwtExpiresAt(createToken({ sub: 'a', exp: 1790266864 }))).toBe(
      1790266864000,
    );
  });

  it('exp가 없으면 null을 반환한다', () => {
    expect(getJwtExpiresAt(createToken({ sub: 'a' }))).toBeNull();
  });

  it('형식이 올바르지 않으면 null을 반환한다', () => {
    expect(getJwtExpiresAt('not-a-jwt')).toBeNull();
    expect(getJwtExpiresAt('a.%%%.c')).toBeNull();
  });
});
