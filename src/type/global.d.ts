export {};

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event',
      id: string,
      params?: Record<string, unknown>,
    ) => void;
  }
}
