import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';
import { vi } from 'vitest';

// msw 서버 시작
beforeAll(() => {
  vi.resetAllMocks(); // Mock 초기화
  server.listen({ onUnhandledRequest: 'warn' });
});

// 각 테스트 후 핸들러 리셋
afterEach(() => server.resetHandlers());

// msw 서버 종료
afterAll(() => server.close());
