import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as encoding from '../../../util/arrayEncoding';
import { DebateTableData } from '../../../types/type';
import TemplateRow from './TemplateRow';
import { readFileSync } from 'node:fs';
import i18n from '../../../i18n';

const TABLE: DebateTableData = {
  info: { name: '', agenda: '', prosTeamName: '', consTeamName: '' },
  table: [
    {
      stance: 'PROS',
      speechType: '입론',
      boxType: 'NORMAL',
      time: 180,
      timePerTeam: null,
      timePerSpeaking: null,
      speaker: null,
      bell: null,
    },
    {
      stance: 'NEUTRAL',
      speechType: '자유토론',
      boxType: 'TIME_BASED',
      time: null,
      timePerTeam: 600,
      timePerSpeaking: 60,
      speaker: null,
      bell: null,
    },
  ],
};

function renderRow(data = encoding.encodeDebateTableData(TABLE)) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>
      <TemplateRow organizationName="단체" template={{ name: '형식', data }} />
    </QueryClientProvider>,
  );
}

afterEach(async () => {
  vi.restoreAllMocks();
  await i18n.changeLanguage('ko');
});

describe('템플릿 시간표 미리보기', () => {
  it('발언당 제한이 없으면 팀당 시간만 표시한다', async () => {
    renderRow(
      encoding.encodeDebateTableData({
        ...TABLE,
        table: [{ ...TABLE.table[1], timePerSpeaking: null }],
      }),
    );
    fireEvent.click(
      screen.getByRole('button', { name: '형식 시간표 미리보기' }),
    );
    expect(await screen.findByText('팀당 10분 0초')).toBeInTheDocument();
    expect(screen.queryByText(/발언당|제한 없음/)).not.toBeInTheDocument();
  });
  it('영문 총 시간과 한 줄 자유토론 시간을 표시한다', async () => {
    const translations = JSON.parse(
      readFileSync('public/locales/en/translation.json', 'utf8'),
    ) as Record<string, string>;
    i18n.addResourceBundle('en', 'translation', translations, true, true);
    await i18n.changeLanguage('en');
    renderRow();
    fireEvent.click(
      screen.getByRole('button', { name: 'Preview 형식 timetable' }),
    );
    await screen.findByRole('table');
    expect(screen.queryByRole('columnheader')).not.toBeInTheDocument();
    expect(screen.getByText('Total 23m 0s')).toBeInTheDocument();
    expect(screen.getByText('Team 10:00 · Turn 01:00')).toBeInTheDocument();
  });
  it('디코딩을 기다리는 동안 로딩 표시를 제공하고 빈 시간표를 안내한다', async () => {
    renderRow(encoding.encodeDebateTableData({ ...TABLE, table: [] }));
    fireEvent.click(
      screen.getByRole('button', { name: '형식 시간표 미리보기' }),
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
    expect(
      await screen.findByText('등록된 순서가 없어요.'),
    ).toBeInTheDocument();
  });
  it('호버할 때만 디코딩하고 재진입할 때 캐시를 사용한다', async () => {
    const user = userEvent.setup();
    const decode = vi.spyOn(encoding, 'decodeDebateTableData');
    renderRow();
    expect(decode).not.toHaveBeenCalled();
    const trigger = screen.getByRole('button', {
      name: '형식 시간표 미리보기',
    });
    await user.hover(trigger);
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.getByText('찬성')).toBeInTheDocument();
    expect(screen.getByText('입론')).toBeInTheDocument();
    expect(screen.getByText('3분 0초')).toBeInTheDocument();
    expect(screen.getByText('팀당 10:00 · 발언당 01:00')).toBeInTheDocument();
    expect(screen.getByText('총 23분 0초')).toBeInTheDocument();
    await user.unhover(trigger);
    await waitFor(() =>
      expect(screen.queryByRole('table')).not.toBeInTheDocument(),
    );
    await user.hover(trigger);
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(decode).toHaveBeenCalledTimes(1);
  });

  it('포커스가 있어도 마우스 이탈 시 닫고 닫기 버튼을 제공하지 않는다', async () => {
    const user = userEvent.setup();
    renderRow();
    await user.tab();
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: '미리보기 닫기' }),
    ).not.toBeInTheDocument();
    await user.keyboard('{Escape}');
    expect(screen.getByRole('table')).toBeInTheDocument();
    await user.hover(screen.getByRole('table'));
    expect(screen.getByRole('table')).toBeInTheDocument();
    await user.unhover(screen.getByRole('table'));
    await waitFor(() =>
      expect(screen.queryByRole('table')).not.toBeInTheDocument(),
    );
    expect(screen.getByRole('link', { name: '형식 토론하기' })).toHaveAttribute(
      'href',
      expect.stringContaining('/share?data='),
    );
  });

  it.each([
    'invalid',
    encoding.encodeDebateTableData({
      ...TABLE,
      table: null,
    } as unknown as DebateTableData),
  ])('손상된 데이터 %s는 지역 오류로 안내한다', async (data) => {
    const user = userEvent.setup();
    renderRow(data);
    await user.click(
      screen.getByRole('button', { name: '형식 시간표 미리보기' }),
    );
    expect(
      await screen.findByText('시간표 미리보기를 불러오지 못했어요.'),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: '형식 토론하기' }),
    ).toBeInTheDocument();
  });
});
