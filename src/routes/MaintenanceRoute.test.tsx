import { render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SAMPLE_TABLE_DATA } from '../constants/sample_table';
import { setSessionCustomizeTableData } from '../util/sessionStorage';
import MaintenanceRoute from './MaintenanceRoute';
import { MaintenanceAccess } from './maintenanceAccess';

interface RenderRouteOptions {
  access: MaintenanceAccess;
  initialEntry: string;
  path: string;
  language?: 'ko' | 'en';
}

async function renderRoute({
  access,
  initialEntry,
  path,
  language = 'ko',
}: RenderRouteOptions) {
  const i18n = createInstance();
  await i18n.init({ lng: language, resources: {} });

  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <Routes>
          <Route
            path={path}
            element={
              <MaintenanceRoute access={access}>
                <div>대상 화면</div>
              </MaintenanceRoute>
            }
          />
          <Route path="/home" element={<div>한국어 점검 홈</div>} />
          <Route path="/en/home" element={<div>영어 점검 홈</div>} />
        </Routes>
      </MemoryRouter>
    </I18nextProvider>,
  );
}

describe('점검 라우트 보호', () => {
  beforeEach(() => {
    sessionStorage.clear();
    vi.stubEnv('VITE_MAINTENANCE_MODE', 'true');
  });

  afterEach(() => {
    sessionStorage.clear();
    vi.unstubAllEnvs();
  });

  test('게스트 세션과 정확한 쿼리가 있으면 편집 화면을 허용한다', async () => {
    setSessionCustomizeTableData(SAMPLE_TABLE_DATA);
    await renderRoute({
      access: 'guest-composition',
      initialEntry: '/composition?mode=edit&type=CUSTOMIZE',
      path: '/composition',
    });

    expect(screen.getByText('대상 화면')).toBeInTheDocument();
  });

  test('게스트 세션이 없으면 허용 URL도 점검 홈으로 이동한다', async () => {
    await renderRoute({
      access: 'guest-overview',
      initialEntry: '/overview/customize/guest',
      path: '/overview/:type/:id',
    });

    expect(await screen.findByText('한국어 점검 홈')).toBeInTheDocument();
  });

  test('영어 숫자 ID 경로는 영어 점검 홈으로 이동한다', async () => {
    setSessionCustomizeTableData(SAMPLE_TABLE_DATA);
    await renderRoute({
      access: 'guest-overview',
      initialEntry: '/en/overview/customize/10',
      path: '/en/overview/:type/:id',
      language: 'en',
    });

    expect(await screen.findByText('영어 점검 홈')).toBeInTheDocument();
  });

  test('일반 모드에서는 차단 대상 화면도 그대로 표시한다', async () => {
    vi.stubEnv('VITE_MAINTENANCE_MODE', 'false');
    await renderRoute({
      access: 'blocked',
      initialEntry: '/oauth',
      path: '/oauth',
    });

    expect(screen.getByText('대상 화면')).toBeInTheDocument();
  });
});
