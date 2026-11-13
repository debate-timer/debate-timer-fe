import { USING_ORGANIZATIONS } from './usingOrganizations';

describe('사용 조직 목록', () => {
  it('노출 허락을 받은 조직만 담는다', () => {
    expect(USING_ORGANIZATIONS.map(({ name }) => name)).toEqual([
      '이감',
      '코기토',
      'FEDC',
      '서방정토',
      '노곳떼',
      '토달래',
      '한앎',
      '목포가톨릭대',
      '연세행정법학회',
      '중앙선거방송토론위원회',
      '디베이트 코리아',
    ]);
  });

  it('대학 동아리는 학교 이름을 함께 담는다', () => {
    const affiliations = Object.fromEntries(
      USING_ORGANIZATIONS.map(({ name, affiliation }) => [name, affiliation]),
    );

    expect(affiliations).toMatchObject({
      이감: '경희대',
      코기토: '고려대',
      FEDC: '고려대',
      서방정토: '서강대',
      노곳떼: '한국외대',
      토달래: '성신여대',
      연세행정법학회: '연세대',
    });
    expect(affiliations['목포가톨릭대']).toBeUndefined();
  });

  it('모든 조직에 로고가 있다', () => {
    USING_ORGANIZATIONS.forEach(({ logo }) => {
      expect(logo).toBeTruthy();
    });
  });
});
