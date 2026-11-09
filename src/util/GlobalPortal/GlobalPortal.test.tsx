import { render, screen } from '@testing-library/react';
import { StrictMode } from 'react';
import { describe, expect, it } from 'vitest';
import { GlobalPortal } from './index';

describe('공용 포털', () => {
  it('Strict Mode에서 포털을 한 번 표시하고 언마운트 후 재생성한다', () => {
    const renderPortal = (label: string) => (
      <StrictMode>
        <GlobalPortal.Provider>
          <GlobalPortal.Consumer>
            <button aria-label={label}>{label}</button>
          </GlobalPortal.Consumer>
        </GlobalPortal.Provider>
      </StrictMode>
    );
    const firstMount = render(renderPortal('첫 번째 모달'));

    expect(document.querySelectorAll('#portal-container')).toHaveLength(1);
    expect(
      screen
        .getByRole('button', { name: '첫 번째 모달' })
        .closest('#portal-container'),
    ).not.toBeNull();
    firstMount.rerender(renderPortal('변경된 모달'));
    expect(
      screen.queryByRole('button', { name: '첫 번째 모달' }),
    ).not.toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: '변경된 모달' })).toHaveLength(
      1,
    );
    firstMount.unmount();
    expect(document.querySelector('#portal-container')).toBeNull();

    const secondMount = render(renderPortal('다시 열린 모달'));
    expect(
      screen.getAllByRole('button', { name: '다시 열린 모달' }),
    ).toHaveLength(1);
    secondMount.unmount();
    expect(document.querySelector('#portal-container')).toBeNull();
  });
});
