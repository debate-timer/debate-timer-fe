import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { GlobalPortal } from '../../util/GlobalPortal';
import UpdateModalWrapper from './UpdateModalWrapper';

vi.mock('../../constants/patch_note', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('../../constants/patch_note')>();

  return {
    ...actual,
    LATEST_PATCH_NOTE: {
      mode: 'image-only',
      version: 'test',
      imageKo: '/patch-note-ko.png',
      imageEn: '/patch-note-en.png',
    },
  };
});

async function renderUpdateModalWrapper() {
  const i18n = createInstance();
  await i18n.init({
    lng: 'en',
    fallbackLng: 'ko',
    supportedLngs: ['ko', 'en'],
    resources: {
      en: {
        translation: {
          '모달 닫기': 'Close modal',
          '업데이트 이미지': 'Update image',
          '일주일간 보지 않기': "Don't show again for a week",
          닫기: 'Close',
        },
      },
    },
  });

  return render(
    <I18nextProvider i18n={i18n}>
      <GlobalPortal.Provider>
        <UpdateModalWrapper />
      </GlobalPortal.Provider>
    </I18nextProvider>,
  );
}

describe('UpdateModalWrapper', () => {
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('우측 상단 X 버튼 없이 하단 닫기 버튼만 표시한다', async () => {
    await renderUpdateModalWrapper();

    expect(
      await screen.findByRole('button', { name: 'Close' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Close modal' }),
    ).not.toBeInTheDocument();
  });

  it('하단 닫기 버튼을 누르면 외부 페이지를 열지 않고 모달을 닫는다', async () => {
    const user = userEvent.setup();
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    await renderUpdateModalWrapper();

    await user.click(await screen.findByRole('button', { name: 'Close' }));

    expect(openSpy).not.toHaveBeenCalled();
    expect(
      screen.queryByRole('img', { name: 'Update image' }),
    ).not.toBeInTheDocument();
    expect(localStorage.getItem('update_notification_status')).toBeNull();
  });

  it('일주일 숨김을 선택한 뒤 닫기 버튼을 누르면 숨김 상태를 저장한다', async () => {
    const user = userEvent.setup();
    await renderUpdateModalWrapper();

    await user.click(
      await screen.findByRole('checkbox', {
        name: "Don't show again for a week",
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Close' }));

    const storedStatus = JSON.parse(
      localStorage.getItem('update_notification_status') ?? '{}',
    );
    expect(storedStatus).toEqual({
      version: 'test',
      dismissedAt: expect.any(String),
    });
  });
});
