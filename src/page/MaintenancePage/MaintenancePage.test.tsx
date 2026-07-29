import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SAMPLE_TABLE_DATA } from '../../constants/sample_table';
import { getSessionCustomizeTableData } from '../../util/sessionStorage';
import MaintenancePage from './MaintenancePage';

const STORAGE_KEY = 'DebateTableData';

async function renderMaintenancePage(language: 'ko' | 'en' = 'ko') {
  const i18n = createInstance();
  await i18n.init({
    lng: language,
    fallbackLng: 'ko',
    resources: {
      ko: {
        translation: {
          '서비스 점검 중': '서비스 점검 중',
          "죄송합니다. 나중에 다시 시도해주세요... 😭 대신, 오프라인 모드로 타이머를 사용해볼 수 있으니, 필요하신 경우 '{{action}}' 버튼을 클릭해주세요.":
            "죄송합니다. 나중에 다시 시도해주세요... 😭 대신, 오프라인 모드로 타이머를 사용해볼 수 있으니, 필요하신 경우 '{{action}}' 버튼을 클릭해주세요.",
          '오프라인으로 시작하기': '오프라인으로 시작하기',
          '오프라인으로 이어하기': '오프라인으로 이어하기',
        },
      },
      en: {
        translation: {
          '서비스 점검 중': 'Service Under Maintenance',
          "죄송합니다. 나중에 다시 시도해주세요... 😭 대신, 오프라인 모드로 타이머를 사용해볼 수 있으니, 필요하신 경우 '{{action}}' 버튼을 클릭해주세요.":
            'Sorry, please try again later... 😭 In the meantime, you can still use the timer in offline mode. If you need it, select “{{action}}.”',
          '오프라인으로 시작하기': 'Start Offline',
          '오프라인으로 이어하기': 'Continue Offline',
        },
      },
    },
  });

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[language === 'ko' ? '/home' : '/en/home']}>
        <Routes>
          <Route path="/home" element={<MaintenancePage />} />
          <Route path="/en/home" element={<MaintenancePage />} />
          <Route
            path="/overview/customize/guest"
            element={<div>게스트 개요</div>}
          />
          <Route
            path="/en/overview/customize/guest"
            element={<div>Guest overview</div>}
          />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );
}

describe('점검 화면', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  test('게스트 세션이 없으면 샘플 데이터로 오프라인 흐름을 시작한다', async () => {
    const user = userEvent.setup();
    await renderMaintenancePage();

    expect(
      screen.getByRole('heading', { name: '서비스 점검 중' }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: '오프라인으로 시작하기' }),
    );

    expect(await screen.findByText('게스트 개요')).toBeInTheDocument();
    expect(getSessionCustomizeTableData()).toEqual({
      id: -1,
      ...SAMPLE_TABLE_DATA,
    });
  });

  test('기존 게스트 세션이 있으면 데이터를 덮어쓰지 않고 이어간다', async () => {
    const user = userEvent.setup();
    const existingData = {
      id: -1,
      info: { ...SAMPLE_TABLE_DATA.info, name: '수정한 시간표' },
      table: SAMPLE_TABLE_DATA.table,
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));
    await renderMaintenancePage();

    expect(
      screen.getByText(/'오프라인으로 이어하기' 버튼/),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: '오프라인으로 이어하기' }),
    );

    expect(await screen.findByText('게스트 개요')).toBeInTheDocument();
    expect(getSessionCustomizeTableData()).toEqual(existingData);
  });

  test('영어에서는 영어 안내와 CTA를 표시한다', async () => {
    await renderMaintenancePage('en');

    expect(
      screen.getByRole('heading', { name: 'Service Under Maintenance' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Start Offline' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/select “Start Offline.”/)).toBeInTheDocument();
  });
});
