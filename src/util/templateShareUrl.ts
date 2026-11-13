import { DebateTemplate } from '../types/type';
import { createTableShareUrlFromEncodedData } from './arrayEncoding';

/**
 * 단체 템플릿으로 토론을 시작하는 공유 링크를 만듦.
 * 유입 분석을 위해 템플릿 출처와 단체·템플릿 이름을 쿼리로 덧붙임.
 */
export function createTemplateShareUrl(
  organizationName: string,
  template: DebateTemplate,
): string {
  return `${createTableShareUrlFromEncodedData(template.data)}&source=template&org=${encodeURIComponent(organizationName)}&tmpl=${encodeURIComponent(template.name)}`;
}
