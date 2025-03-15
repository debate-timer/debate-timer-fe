import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GlobalPortal } from '../../util/GlobalPortal';
import { MemoryRouter } from 'react-router-dom';
import { render, screen } from '@testing-library/react';
import DialogModal from './DialogModal';
import { expect } from 'vitest';

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

describe('DialogModal', () => {
  const renderDialogModal = () => {
    return render(
      <TestWrapper>
        <DialogModal
          leftText="왼쪽"
          rightText="오른쪽"
          onLeftClick={() => {}}
          onRightClick={() => {}}
          isRightBold={true}
        >
          <h1 data-testid="container-text">컨테이너 텍스트</h1>
        </DialogModal>
      </TestWrapper>,
    );
  };

  it('컨테이너 및 컨테이너 컨텐츠 렌더링 검증', () => {
    renderDialogModal();

    const ancestor = screen.getByTestId('container');
    const descendant = screen.getByTestId('container-text');

    expect(ancestor).toBeInTheDocument();
    expect(ancestor).toContainElement(descendant);
    expect(descendant).toHaveTextContent('컨테이너 텍스트');
  });

  it('버튼 렌더링 검증', () => {
    renderDialogModal();

    const leftButton = screen.getByTestId('button-left');
    const rightButton = screen.getByTestId('button-right');

    expect(leftButton).toBeInTheDocument();
    expect(rightButton).toBeInTheDocument();

    // Checks whether right button text's font weight is bold
    expect(screen.getByText('오른쪽')).toHaveClass('font-bold');
  });
});
