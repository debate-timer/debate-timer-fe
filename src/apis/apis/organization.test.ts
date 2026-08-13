import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { GetOrganizationTemplatesResponseType } from '../responses/organization';
import { getOrganizationTemplates } from './organization';

const mockTemplatesResponse: GetOrganizationTemplatesResponseType = {
  organizations: [
    {
      organization: '테스트 기관',
      affiliation: '테스트 대학',
      iconPath: '/icon/test.png',
      templates: [],
    },
  ],
};

describe('조직 템플릿 조회 API', () => {
  test('language=KO_KR 쿼리 파라미터와 함께 템플릿을 조회한다', async () => {
    let capturedLanguage: string | null = null;

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguage = url.searchParams.get('language');
        return HttpResponse.json(mockTemplatesResponse);
      }),
    );

    const data = await getOrganizationTemplates('KO_KR');

    expect(capturedLanguage).toBe('KO_KR');
    expect(data).toEqual(mockTemplatesResponse);
  });

  test('language=US_EN 쿼리 파라미터와 함께 템플릿을 조회한다', async () => {
    let capturedLanguage: string | null = null;

    server.use(
      http.get(ApiUrl.organization + '/templates', ({ request }) => {
        const url = new URL(request.url);
        capturedLanguage = url.searchParams.get('language');
        return HttpResponse.json(mockTemplatesResponse);
      }),
    );

    const data = await getOrganizationTemplates('US_EN');

    expect(capturedLanguage).toBe('US_EN');
    expect(data).toEqual(mockTemplatesResponse);
  });
});
