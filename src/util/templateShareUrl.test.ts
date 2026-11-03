import { createTemplateShareUrl } from './templateShareUrl';
import { createTableShareUrlFromEncodedData } from './arrayEncoding';

describe('템플릿 공유 링크 생성', () => {
  it('공유 링크에 템플릿 출처와 단체·템플릿 이름을 붙인다', () => {
    const url = createTemplateShareUrl('한토막', {
      name: 'CEDA 토론',
      data: 'encoded',
    });

    expect(url).toBe(
      `${createTableShareUrlFromEncodedData('encoded')}&source=template&org=${encodeURIComponent('한토막')}&tmpl=${encodeURIComponent('CEDA 토론')}`,
    );
  });

  it('이름의 특수문자를 URL 인코딩한다', () => {
    const url = createTemplateShareUrl('A&B', { name: '2:2 자유?', data: 'd' });

    expect(url).toContain('org=A%26B');
    expect(url).toContain('tmpl=2%3A2%20%EC%9E%90%EC%9C%A0%3F');
  });
});
