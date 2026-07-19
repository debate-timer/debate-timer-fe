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
      link: '',
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
          '일주일 간 보지 않기': "Don't show again for a week",
          '자세히 보기': 'View details',
          '패치 노트 링크를 읽는 중 오류가 발생했습니다.':
            'An error occurred while loading the patch note link.',
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

  test('패치 노트 링크가 없으면 현재 언어로 오류를 안내한다', async () => {
    const user = userEvent.setup();
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {});
    localStorage.clear();
    await renderUpdateModalWrapper();

    await user.click(
      await screen.findByRole('button', { name: 'View details' }),
    );

    expect(alertSpy).toHaveBeenCalledWith(
      'An error occurred while loading the patch note link.',
    );
  });

  test('image-only 모달의 닫기 버튼만 표시하고 클릭하면 모달을 닫는다', async () => {
    const user = userEvent.setup();
    await renderUpdateModalWrapper();

    const closeButtons = await screen.findAllByRole('button', {
      name: 'Close modal',
    });

    expect(closeButtons).toHaveLength(1);

    await user.click(closeButtons[0]);

    expect(
      screen.queryByRole('button', { name: 'Close modal' }),
    ).not.toBeInTheDocument();
  });

  test('일주일 숨김을 선택한 뒤 닫기 버튼을 누르면 숨김 상태를 저장한다', async () => {
    const user = userEvent.setup();
    await renderUpdateModalWrapper();

    await user.click(
      await screen.findByRole('checkbox', {
        name: "Don't show again for a week",
      }),
    );
    await user.click(screen.getByRole('button', { name: 'Close modal' }));

    const storedStatus = JSON.parse(
      localStorage.getItem('update_notification_status') ?? '{}',
    );
    expect(storedStatus).toEqual({
      version: 'test',
      dismissedAt: expect.any(String),
    });
  });
});
