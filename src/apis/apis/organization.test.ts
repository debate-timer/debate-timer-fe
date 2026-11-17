import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { GetOrganizationTemplatesResponseType } from '../responses/organization';
import { APIError } from '../primitives';
import { ApiLanguageCode, getOrganizationTemplates } from './organization';

const KO_RESPONSE: GetOrganizationTemplatesResponseType = {
  organizations: [
    {
      organization: '국문 단체',
      category: 'DEBATE_CLUB',
      affiliation: '',
      iconPath: '',
      templates: [],
    },
    {
      organization: '국문 대회',
      category: 'TOURNAMENT',
      affiliation: '',
      iconPath: '',
      templates: [],
    },
  ],
};
const EN_RESPONSE: GetOrganizationTemplatesResponseType = {
  organizations: [
    {
      organization: 'English',
      category: 'CLASSIC',
      affiliation: '',
      iconPath: '',
      templates: [],
    },
  ],
};

describe('조직 템플릿 조회 API', () => {
  let languages: (string | null)[];

  beforeEach(() => {
    languages = [];
    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const language = new URL(request.url).searchParams.get('language');
        languages.push(language);
        return HttpResponse.json(
          language === 'KO_KR' ? KO_RESPONSE : EN_RESPONSE,
        );
      }),
    );
  });

  it.each<ApiLanguageCode>(['KO_KR', 'US_EN'])(
    '지정한 %s 언어만 GET으로 조회하고 카테고리를 보존한다',
    async (language) => {
      expect(await getOrganizationTemplates(language)).toEqual(
        language === 'KO_KR' ? KO_RESPONSE : EN_RESPONSE,
      );
      expect(languages).toEqual([language]);
    },
  );

  it.each([undefined, null])(
    '언어가 %s이면 두 언어를 조회하고 국문 다음 영문으로 연결한다',
    async (language) => {
      expect(await getOrganizationTemplates(language)).toEqual({
        organizations: [
          ...KO_RESPONSE.organizations,
          ...EN_RESPONSE.organizations,
        ],
      });
      expect(languages.sort()).toEqual(['KO_KR', 'US_EN']);
    },
  );

  it('인자를 생략하면 두 언어를 조회한다', async () => {
    expect(await getOrganizationTemplates()).toEqual({
      organizations: [
        ...KO_RESPONSE.organizations,
        ...EN_RESPONSE.organizations,
      ],
    });
    expect(languages.sort()).toEqual(['KO_KR', 'US_EN']);
  });

  it.each(['KO_KR', 'US_EN', 'BOTH'])(
    '%s 목록이 비어 있어도 정상 통합한다',
    async (emptyLanguage) => {
      server.use(
        http.get(ApiUrl.organization + '/templates', ({ request }) => {
          const language = new URL(request.url).searchParams.get('language');
          return HttpResponse.json(
            language === emptyLanguage || emptyLanguage === 'BOTH'
              ? { organizations: [] }
              : language === 'KO_KR'
                ? KO_RESPONSE
                : EN_RESPONSE,
          );
        }),
      );
      const expected =
        emptyLanguage === 'BOTH'
          ? []
          : emptyLanguage === 'KO_KR'
            ? EN_RESPONSE.organizations
            : KO_RESPONSE.organizations;
      expect(await getOrganizationTemplates()).toEqual({
        organizations: expected,
      });
    },
  );

  it('두 요청을 병렬로 시작하고 느린 응답까지 기다린다', async () => {
    let releaseEnglish!: () => void;
    let englishStarted = false;
    const englishGate = new Promise<void>((resolve) => {
      releaseEnglish = resolve;
    });
    server.use(
      http.get(ApiUrl.organization + '/templates', async ({ request }) => {
        if (new URL(request.url).searchParams.get('language') === 'US_EN') {
          englishStarted = true;
          await englishGate;
          return HttpResponse.json(EN_RESPONSE);
        }
        await vi.waitFor(() => expect(englishStarted).toBe(true));
        return HttpResponse.json(KO_RESPONSE);
      }),
    );
    let settled = false;
    const pending = getOrganizationTemplates().then((result) => {
      settled = true;
      return result;
    });
    try {
      await vi.waitFor(() => expect(englishStarted).toBe(true));
      expect(settled).toBe(false);
    } finally {
      releaseEnglish();
    }
    expect(await pending).toEqual({
      organizations: [
        ...KO_RESPONSE.organizations,
        ...EN_RESPONSE.organizations,
      ],
    });
  });

  it.each<ApiLanguageCode>(['KO_KR', 'US_EN'])(
    '%s 조회가 실패하면 부분 결과 대신 오류를 전달한다',
    async (failedLanguage) => {
      server.use(
        http.get(ApiUrl.organization + '/templates', ({ request }) =>
          new URL(request.url).searchParams.get('language') === failedLanguage
            ? HttpResponse.json({}, { status: 500 })
            : HttpResponse.json(
                failedLanguage === 'KO_KR' ? EN_RESPONSE : KO_RESPONSE,
              ),
        ),
      );
      await expect(getOrganizationTemplates()).rejects.toBeInstanceOf(APIError);
    },
  );
});
