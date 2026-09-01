import { useQuery } from '@tanstack/react-query';
import { GetOrganizationTemplatesResponseType } from '../../apis/responses/organization';
import {
  getOrganizationTemplates,
  ApiLanguageCode,
} from '../../apis/apis/organization';
import i18n from '../../i18n';

const LANG_MAP: Record<string, ApiLanguageCode> = {
  ko: 'KO_KR',
  en: 'US_EN',
};

function getApiLanguage(): ApiLanguageCode {
  return LANG_MAP[i18n.language] ?? 'KO_KR';
}

export function useGetOrganizationTemplates(enabled?: boolean) {
  const language = getApiLanguage();
  return useQuery<GetOrganizationTemplatesResponseType>({
    queryKey: ['OrganizationTemplates', language],
    queryFn: () => getOrganizationTemplates(language),
    enabled,
    throwOnError: false,
  });
}
