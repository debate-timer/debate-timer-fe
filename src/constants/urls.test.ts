afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('문의 환경 변수', () => {
  it.each([0, 1, 3])(
    '설정된 %s개 링크만 순서대로 표시하고 공백을 제거한다',
    async (count) => {
      vi.resetModules();
      const keys = [
        'VITE_GENERAL_INQUIRY_URL',
        'VITE_TEMPLATE_REQUEST_URL',
        'VITE_PARTNERSHIP_INQUIRY_URL',
      ];
      keys.forEach((key, index) =>
        vi.stubEnv(
          key,
          index < count ? ` https://example.com/${index} ` : '  ',
        ),
      );
      const { INQUIRY_LINKS } = await import('./urls');
      expect(INQUIRY_LINKS.map((item) => item.url)).toEqual(
        Array.from(
          { length: count },
          (_, index) => `https://example.com/${index}`,
        ),
      );
    },
  );
});
