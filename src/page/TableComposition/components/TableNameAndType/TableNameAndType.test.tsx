import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import { GlobalPortal } from '../../../../util/GlobalPortal';
import { DebateInfo } from '../../../../type/type';
import TableNameAndType from './TableNameAndType';

// ------------------
// 헬퍼: 유효한 기본 info 를 만들고 필요한 필드만 덮어쓴다.
// ------------------
function makeInfo(overrides: Partial<DebateInfo> = {}): DebateInfo {
  return {
    name: '토론 시간표',
    agenda: '토론 주제',
    prosTeamName: '우리팀',
    consTeamName: '상대팀',
    ...overrides,
  };
}

function renderComponent(info: DebateInfo, onButtonClick = vi.fn()) {
  const queryClient = new QueryClient();
  render(
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter>
          <TableNameAndType
            info={info}
            isLoading={false}
            onInfoChange={vi.fn()}
            onButtonClick={onButtonClick}
          />
        </MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>,
  );
}

async function clickNext() {
  await userEvent.click(screen.getByRole('button', { name: '다음' }));
}

describe('TableNameAndType - 제출 검증 alert', () => {
  let alertSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  afterEach(() => {
    alertSpy.mockRestore();
  });

  it('시간표 이름 길이 초과 시 사유 메시지를 alert 로 노출하고 진행을 막는다', async () => {
    const onButtonClick = vi.fn();
    renderComponent(makeInfo({ name: 'a'.repeat(21) }), onButtonClick);

    await clickNext();

    expect(alertSpy).toHaveBeenCalledOnce();
    expect(alertSpy.mock.calls[0][0]).toContain(
      '시간표 이름은 최대 20자까지 입력할 수 있습니다.',
    );
    expect(onButtonClick).not.toHaveBeenCalled();
  });

  it('토론 주제 길이 초과 시 사유 메시지를 alert 로 노출한다', async () => {
    renderComponent(makeInfo({ agenda: 'a'.repeat(256) }));

    await clickNext();

    expect(alertSpy).toHaveBeenCalledOnce();
    expect(alertSpy.mock.calls[0][0]).toContain(
      '토론 주제는 최대 255자까지 입력할 수 있습니다.',
    );
  });

  it('팀명 길이 초과 시 사유 메시지를 alert 로 노출한다', async () => {
    renderComponent(makeInfo({ prosTeamName: 'a'.repeat(16) }));

    await clickNext();

    expect(alertSpy).toHaveBeenCalledOnce();
    expect(alertSpy.mock.calls[0][0]).toContain(
      '팀명은 최대 15자까지 입력할 수 있습니다.',
    );
  });

  it('팀명에 사용할 수 없는 문자가 있으면 형식 오류 메시지를 alert 로 노출한다', async () => {
    // 제어문자(U+0001)는 NAME_REGEX 를 통과하지 못한다(FORM 오류).
    renderComponent(
      makeInfo({ consTeamName: `team${String.fromCharCode(1)}` }),
    );

    await clickNext();

    expect(alertSpy).toHaveBeenCalledOnce();
    expect(alertSpy.mock.calls[0][0]).toContain(
      '팀명에 사용할 수 없는 문자가 포함되어 있습니다.',
    );
  });

  it('여러 필드가 잘못되면 사유들을 줄바꿈으로 합쳐 한 번에 노출한다', async () => {
    renderComponent(
      makeInfo({ name: 'a'.repeat(21), prosTeamName: 'b'.repeat(16) }),
    );

    await clickNext();

    expect(alertSpy).toHaveBeenCalledOnce();
    const message = alertSpy.mock.calls[0][0] as string;
    expect(message).toContain('시간표 이름은 최대 20자까지 입력할 수 있습니다.');
    expect(message).toContain('팀명은 최대 15자까지 입력할 수 있습니다.');
    expect(message.split('\n').length).toBeGreaterThanOrEqual(2);
  });

  it('모든 필드가 유효하면 alert 없이 onButtonClick 을 호출한다', async () => {
    const onButtonClick = vi.fn();
    renderComponent(makeInfo(), onButtonClick);

    await clickNext();

    expect(alertSpy).not.toHaveBeenCalled();
    expect(onButtonClick).toHaveBeenCalledOnce();
  });
});
