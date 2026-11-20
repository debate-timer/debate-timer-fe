import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { GetOrganizationTemplatesResponseType } from '../responses/organization';

export type ApiLanguageCode = 'KO_KR' | 'US_EN';

// GET /api/organizations/templates
/**
 * 언어 생략·undefined·null은 두 언어를 병렬 조회해 국문 다음 영문으로 연결함.
 * 서버는 language 생략으로 전체 조회도 지원하지만 기존 FE 병렬 조회 계약을 유지함.
 * 한쪽이라도 실패하면 부분 결과 대신 오류를 전달함.
 */
export async function getOrganizationTemplates(
  language?: ApiLanguageCode | null,
): Promise<GetOrganizationTemplatesResponseType> {
  if (language != null) {
    return getOrganizationTemplatesByLanguage(language);
  }

  const [korean, english] = await Promise.all([
    getOrganizationTemplatesByLanguage('KO_KR'),
    getOrganizationTemplatesByLanguage('US_EN'),
  ]);

  return { organizations: [...korean.organizations, ...english.organizations] };
}

async function getOrganizationTemplatesByLanguage(
  language: ApiLanguageCode,
): Promise<GetOrganizationTemplatesResponseType> {
  const requestUrl: string = ApiUrl.organization + '/templates';
  const response = await request<GetOrganizationTemplatesResponseType>(
    'GET',
    requestUrl,
    null,
    { language },
  );

  return response.data;
}
