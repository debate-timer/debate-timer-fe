import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getOrganizationTemplates } from '../../apis/apis/organization';
import { getSelectedLang } from '../../util/languageRouting';
import { GetOrganizationTemplatesResponseType } from '../../apis/responses/organization';

function selectSortedOrganizations(data: GetOrganizationTemplatesResponseType) {
  return {
    ...data,
    organizations: [...data.organizations].sort((a, b) =>
      a.organization.localeCompare(b.organization, 'en', {
        sensitivity: 'base',
      }),
    ),
  };
}

/**
 * 랜딩·전체보기에서 한국어는 통합 목록, 영어는 영문 목록을 제공함.
 * 언어 변경을 구독하고 통합·단일 언어 캐시를 분리하며 오류는 화면에서 처리함.
 * 원본 캐시를 보존하고 조직명 기준 영문 A–Z·한글 가나다순으로 제공함.
 */
export default function useGetOrganizationTemplates(enabled?: boolean) {
  const { i18n } = useTranslation();
  const lang = getSelectedLang(i18n.resolvedLanguage ?? i18n.language);
  const language = lang === 'en' ? 'US_EN' : undefined;

  return useQuery({
    queryKey: ['OrganizationTemplates', language ?? 'ALL'],
    queryFn: () => getOrganizationTemplates(language),
    select: selectSortedOrganizations,
    enabled,
    throwOnError: false,
  });
}
