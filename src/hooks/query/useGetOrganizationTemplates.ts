import { useQuery } from '@tanstack/react-query';
import { GetOrganizationTemplatesResponseType } from '../../apis/responses/organization';
import { getOrganizationTemplates } from '../../apis/apis/organization';

export function useGetOrganizationTemplates(enabled?: boolean) {
  return useQuery<GetOrganizationTemplatesResponseType>({
    queryKey: ['OrganizationTemplates'],
    queryFn: () => getOrganizationTemplates(),
    enabled,
    throwOnError: false,
  });
}
