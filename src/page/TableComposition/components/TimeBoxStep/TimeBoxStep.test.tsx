// TableSetup.test.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TimeBoxStep from './TimeBoxStep';

import { MemoryRouter } from 'react-router-dom';
import { GlobalPortal } from '../../../../util/GlobalPortal';
function TestTableSetup() {
  return (
    <MemoryRouter>
      <GlobalPortal.Provider>
        <TimeBoxStep
          initTimeBox={[]}
          onTimeBoxChange={() => {}}
          onButtonClick={() => {}}
        />
      </GlobalPortal.Provider>
    </MemoryRouter>
  );
}
describe('TableSetup', () => {
  it('왼쪽 + 버튼 클릭 → 모달 → "타임박스 설정하기" → 찬성 박스 생성', async () => {
    render(<TestTableSetup />);
    const user = userEvent.setup();

    // "+" 버튼: [0] = left, [1] = right
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    expect(plusButtons).toHaveLength(2);

    // 왼쪽 + 버튼 클릭
    await user.click(plusButtons[0]);

    // 모달 열림 확인
    expect(
      screen.getByRole('heading', { name: '타임박스 설정' }),
    ).toBeInTheDocument();

    // "타임박스 설정하기" 버튼 클릭
    await user.click(screen.getByRole('button', { name: '타임박스 설정하기' }));

    // 모달이 닫혔는지 확인
    expect(
      screen.queryByRole('heading', { name: '타임박스 설정' }),
    ).not.toBeInTheDocument();

    //박스 생성 확인
    expect(screen.getByText('토론자', { exact: false })).toBeInTheDocument();
  });

  it('오른쪽 + 버튼 클릭 → 반대 박스 생성', async () => {
    render(<TestTableSetup />);
    const user = userEvent.setup();

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    // 오른쪽 + 버튼 클릭
    await user.click(plusButtons[1]);

    // 모달 열림 확인
    expect(
      screen.getByRole('heading', { name: '타임박스 설정' }),
    ).toBeInTheDocument();

    // "타임박스 설정하기" 버튼 클릭
    await user.click(screen.getByRole('button', { name: '타임박스 설정하기' }));
    // 모달 닫힘
    expect(
      screen.queryByRole('heading', { name: '타임박스 설정' }),
    ).not.toBeInTheDocument();

    //박스 생성 확인
    expect(screen.getByText('토론자', { exact: false })).toBeInTheDocument();
  });

  it('"유형"에 작전시간을 선택하면 입장 드롭박스가 비활성화되고, 설정 시 작전시간 박스가 생성된다.', async () => {
    render(<TestTableSetup />);
    const user = userEvent.setup();

    // 왼쪽 + 버튼 클릭
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);

    // 모달 열림 확인
    expect(
      screen.getByRole('heading', { name: '타임박스 설정' }),
    ).toBeInTheDocument();

    const debateTypeSelect = screen.getByLabelText('유형') as HTMLSelectElement;
    // "작전시간" 옵션 선택
    await user.selectOptions(debateTypeSelect, 'TIME_OUT');

    // "입장" 셀렉트 박스가 이제 disabled 상태인지 확인
    const stanceSelect = screen.getByLabelText('입장') as HTMLSelectElement;
    expect(stanceSelect).toBeDisabled();

    // "타임박스 설정하기" 클릭
    await user.click(screen.getByRole('button', { name: '타임박스 설정하기' }));

    // 모달 닫힘
    expect(
      screen.queryByRole('heading', { name: '타임박스 설정' }),
    ).not.toBeInTheDocument();

    // DebatePanel이 "작전시간" 인지 확인
    expect(screen.getByText('작전 시간', { exact: false })).toBeInTheDocument();
  });
  it('DebatePanel 수정 기능: Edit 버튼 클릭 → 모달에서 시간 변경 → 반영 여부 확인', async () => {
    render(<TestTableSetup />);
    const user = userEvent.setup();

    // 1) 새로운 DebatePanel 하나 추가(예: 찬성)
    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);

    await user.click(screen.getByRole('button', { name: '타임박스 설정하기' }));

    expect(screen.getByText('3분 0초')).toBeInTheDocument();

    const editButton = screen.getByRole('button', { name: '수정하기' });

    await user.click(editButton);

    // 모달 열림 확인: "타임박스 설정" 타이틀
    expect(
      screen.getByRole('heading', { name: '타임박스 설정' }),
    ).toBeInTheDocument();

    const spinButtons = screen.getAllByRole('spinbutton');
    await user.clear(spinButtons[0]);
    await user.type(spinButtons[0], '4');
    await user.clear(spinButtons[1]);
    await user.type(spinButtons[1], '30');

    await user.click(screen.getByRole('button', { name: '타임박스 설정하기' }));
    expect(
      screen.queryByRole('heading', { name: '타임박스 설정' }),
    ).not.toBeInTheDocument();

    expect(screen.getByText('4분 30초')).toBeInTheDocument();
  });

  it('DebatePanel 삭제 기능: Delete 버튼 클릭 → 확인 모달에서 "삭제하기" → DebatePanel 제거', async () => {
    render(<TestTableSetup />);
    const user = userEvent.setup();

    const plusButtons = screen.getAllByRole('button', { name: '+' });
    await user.click(plusButtons[0]);
    await user.click(screen.getByRole('button', { name: '타임박스 설정하기' }));

    expect(screen.getByText('3분 0초')).toBeInTheDocument();

    const deleteButton = screen.getByRole('button', { name: '삭제하기' });
    await user.click(deleteButton);

    expect(screen.getByText(/삭제하시겠습니까/i)).toBeInTheDocument();

    const modal = screen
      .getByText('타임 박스를 삭제하시겠습니까?')
      .closest('div')!;

    const confirmDeleteBtn = within(modal).getByRole('button', {
      name: '삭제하기',
    });
    await user.click(confirmDeleteBtn);

    expect(screen.queryByText('3분 0초')).not.toBeInTheDocument();
  });
});
