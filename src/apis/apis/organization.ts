import { ApiUrl } from '../endpoints';
import { request } from '../primitives';
import { GetOrganizationTemplatesResponseType } from '../responses/organization';

// GET /api/organizations/templates
export async function getOrganizationTemplates(): Promise<GetOrganizationTemplatesResponseType> {
  const requestUrl: string = ApiUrl.organization + '/templates';
  const response = await request<GetOrganizationTemplatesResponseType>(
    'GET',
    requestUrl,
    null,
    null,
  );

  return response.data;
}
