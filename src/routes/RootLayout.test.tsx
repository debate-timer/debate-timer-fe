import { act, render, screen } from '@testing-library/react';
import { createMemoryRouter, Outlet, RouterProvider } from 'react-router-dom';
import RootLayout from './RootLayout';

vi.mock('../components/ErrorBoundary/ErrorBoundaryWrapper', () => ({
  default: () => <Outlet />,
}));

describe('앱 루트 레이아웃', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    sessionStorage.clear();
  });

  it('다른 페이지로 이동하면 스크롤을 맨 위로 올린다', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => {});
    const router = createMemoryRouter(
      [
        {
          element: <RootLayout />,
          children: [
            { path: '/', element: <div>메인</div> },
            { path: '/templates', element: <div>템플릿</div> },
          ],
        },
      ],
      { initialEntries: ['/'] },
    );
    render(<RouterProvider router={router} />);
    scrollTo.mockClear();

    await act(() => router.navigate('/templates'));

    expect(await screen.findByText('템플릿')).toBeInTheDocument();
    expect(scrollTo).toHaveBeenCalledWith(0, 0);
  });
});
