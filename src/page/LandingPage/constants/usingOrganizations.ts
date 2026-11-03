export interface UsingOrganization {
  name: string;
  /** 로고 이미지 경로. 없으면 이름 첫 글자로 대신함 */
  logo: string | null;
}

// TODO: 리드 확인을 거친 실제 사용 조직 목록과 로고로 교체함. 지금은 화면 확인용 mock 데이터임.
export const USING_ORGANIZATIONS: UsingOrganization[] = Array.from(
  { length: 12 },
  (_, index) => ({ name: `Organization ${index + 1}`, logo: null }),
);
