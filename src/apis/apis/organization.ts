import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { GetOrganizationTemplatesResponseType } from '../responses/organization';

export type ApiLanguageCode = 'KO_KR' | 'US_EN';

// GET /api/organizations/templates
export async function getOrganizationTemplates(
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
