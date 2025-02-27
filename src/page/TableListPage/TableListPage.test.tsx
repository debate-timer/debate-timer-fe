import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TableListPage from './TableListPage';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { waitFor } from '@testing-library/react';
import { GlobalPortal } from '../../util/GlobalPortal';

function TestWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <GlobalPortal.Provider>
        <MemoryRouter>{children}</MemoryRouter>
      </GlobalPortal.Provider>
    </QueryClientProvider>
  );
}

vi.mock('../../layout/defaultLayout/DefaultLayout', () => {
  const HeaderLeft = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-left">{children}</div>
  );
  const HeaderCenter = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-center">{children}</div>
  );
  const HeaderRight = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header-right">{children}</div>
  );
  const Header = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="header">{children}</div>
  );

  Header.Left = HeaderLeft;
  Header.Center = HeaderCenter;
  Header.Right = HeaderRight;

  const ContentContainer = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="content-container">{children}</div>
  );
  const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="default-layout">{children}</div>
  );
  DefaultLayout.displayName = 'DefaultLayout';
  DefaultLayout.Header = Header;
  DefaultLayout.ContentContanier = ContentContainer;

  return {
    default: DefaultLayout,
  };
});

vi.mock('./components/Table/AddTable', () => ({
  default: function AddTable() {
    return <div data-testid="add-table">테이블 추가</div>;
  },
}));

// react-router-dom의 useNavigate 모의(Mock)
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe('TableListPage', () => {
  const renderTableListPage = () => {
    return render(
      <TestWrapper>
        <TableListPage />
      </TestWrapper>,
    );
  };

  it('DefaultLayout 렌더링 검증', async () => {
    renderTableListPage();
    expect(screen.getByTestId('default-layout')).toBeInTheDocument();
  });

  it('헤더 렌더링 검증', () => {
    renderTableListPage();
    const headerCenter = screen.getByTestId('header-center');
    expect(headerCenter).toBeInTheDocument();
    expect(headerCenter).toHaveTextContent('토론 시간표를 선택해주세요.');
  });

  it('Table 렌더링 검증', async () => {
    renderTableListPage();
    await waitFor(() => {
      const tables = screen.getAllByRole('button', { name: /테이블 \d+/i });
      expect(tables).toHaveLength(8);
    });
  });

  it('AddTable 렌더링 검증', () => {
    renderTableListPage();
    expect(screen.getByTestId('add-table')).toBeInTheDocument();
  });

  it('삭제 버튼 클릭 동작 검증', async () => {
    renderTableListPage();
    await waitFor(() => {
      screen.getAllByRole('button', { name: /테이블 \d+/i });
    });

    const deleteButtons = screen.getAllByRole('button', { name: '삭제하기' });
    expect(deleteButtons).toHaveLength(8);

    await userEvent.click(deleteButtons[0]);
    const modalHeader = await screen.findByRole('heading', {
      name: '삭제하시겠습니까?',
    });
    expect(modalHeader).toBeInTheDocument();
  });

  it('수정 버튼 클릭 동작 검증', async () => {
    const navigate = vi.fn();
    (useNavigate as jest.Mock).mockReturnValue(navigate);

    renderTableListPage();

    await waitFor(() => {
      screen.getAllByRole('button', { name: /테이블 \d+/i });
    });

    const editButtons = screen.getAllByRole('button', { name: '수정하기' });
    expect(editButtons).toHaveLength(8);

    await userEvent.click(editButtons[0]);
    expect(navigate).toHaveBeenCalledWith(
      '/composition?mode=edit&tableId=1&type=PARLIAMENTARY',
    );
  });
});
