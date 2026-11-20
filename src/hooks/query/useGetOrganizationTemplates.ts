import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { getOrganizationTemplates } from '../../apis/apis/organization';
import { getSelectedLang } from '../../util/languageRouting';
/**
 * 랜딩·전체보기에서 한국어는 국문 목록, 영어는 영문 목록을 제공함.
 * 언어 변경을 구독하고 언어별 캐시를 분리하며 오류는 화면에서 처리함.
 * 응답 순서를 그대로 제공하며 표시 정렬은 소비처가 소유함.
 */
export default function useGetOrganizationTemplates(enabled?: boolean) {
  const { i18n } = useTranslation();
  const lang = getSelectedLang(i18n.resolvedLanguage ?? i18n.language);
  const language = lang === 'en' ? 'US_EN' : 'KO_KR';

  return useQuery({
    queryKey: ['OrganizationTemplates', language],
    queryFn: () => getOrganizationTemplates(language),
    enabled,
    throwOnError: false,
  });
}
