import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import { server } from './src/mocks/server';
import { vi } from 'vitest';

// msw 서버 시작
beforeAll(() => {
  cleanup();
  vi.resetAllMocks(); // Mock 초기화
  server.listen({ onUnhandledRequest: 'warn' });
});

// 각 테스트 후 핸들러 리셋
afterEach(() => server.resetHandlers());

// msw 서버 종료
afterAll(() => server.close());

// vitest.setup.ts 또는 setupTests.ts
// ResizeObserver를 전역적으로 모킹합니다.
global.ResizeObserver = class ResizeObserver {
  observe() {
    // do nothing
  }
  unobserve() {
    // do nothing
  }
  disconnect() {
    // do nothing
  }
};

// 만약 window 객체에 직접 할당해야 한다면 (예: 일부 라이브러리가 window.ResizeObserver를 직접 참조하는 경우)
// window.ResizeObserver = global.ResizeObserver;
