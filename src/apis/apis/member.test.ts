import { http, HttpResponse } from 'msw';
import axios from 'axios';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { GetMemberFeatureFlagsResponseType } from '../responses/member';
import {
  getMemberFeatureFlags,
  getMemberSettings,
  patchMemberSettings,
} from './member';

describe('회원 API', () => {
  it('로그인한 회원의 피쳐 플래그를 조회한다', async () => {
    const response: GetMemberFeatureFlagsResponseType = {
      featureFlags: ['TRANSCRIPT'],
    };
    let requestedMethod: string | null = null;
    server.use(
      http.get(`${ApiUrl.member}/feature-flags`, ({ request }) => {
        requestedMethod = request.method;
        return HttpResponse.json(response);
      }),
    );

    const data = await getMemberFeatureFlags();

    expect(requestedMethod).toBe('GET');
    expect(data).toEqual(response);
  });
});

describe('회원 설정 API', () => {
  beforeEach(() => {
    localStorage.setItem('accessToken', 'settings-account-a');
    localStorage.setItem('memberId', '1');
  });

  afterEach(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('memberId');
    vi.restoreAllMocks();
  });

  it('인증 헤더로 본인 설정을 조회하고 별도 매개변수를 보내지 않는다', async () => {
    server.use(
      http.get('/api/member/settings', ({ request }) => {
        expect(request.method).toBe('GET');
        expect(request.headers.get('Authorization')).toBe('settings-account-a');
        expect(new URL(request.url).search).toBe('');
        return HttpResponse.json({ language: null, volume: 0.5 });
      }),
    );
    expect(await getMemberSettings()).toEqual({ language: null, volume: 0.5 });
  });

  it('수정 요청은 선택한 필드만 보내고 서버의 정규화 결과를 반환한다', async () => {
    server.use(
      http.patch('/api/member/settings', async ({ request }) => {
        expect(request.headers.get('Authorization')).toBe('settings-account-a');
        expect(await request.json()).toEqual({ volume: 0.74 });
        return HttpResponse.json({ language: 'en', volume: 0.7 });
      }),
    );
    expect(await patchMemberSettings({ volume: 0.74 })).toEqual({
      language: 'en',
      volume: 0.7,
    });
  });

  it('기본값과 부분 수정을 유지하며 계정별 모의 설정을 분리한다', async () => {
    expect(await getMemberSettings()).toEqual({ language: null, volume: 0.5 });
    await patchMemberSettings({ language: 'en' });
    expect(await patchMemberSettings({ volume: 0.76 })).toEqual({
      language: 'en',
      volume: 0.8,
    });
    localStorage.setItem('accessToken', 'settings-account-b');
    expect(await getMemberSettings()).toEqual({ language: null, volume: 0.5 });
    localStorage.setItem('accessToken', 'settings-account-a');
    expect(await getMemberSettings()).toEqual({ language: 'en', volume: 0.8 });
  });

  it.each([0, 1])('음량 경계 %s를 저장한다', async (volume) => {
    expect(await patchMemberSettings({ volume })).toEqual({
      language: null,
      volume,
    });
  });

  it.each([
    {},
    { language: null },
    { language: 'fr' },
    { volume: '0.5' },
    { volume: -0.1 },
    { volume: 1.04 },
    null,
  ])('잘못된 수정 요청 %j의 오류를 전달한다', async (body) => {
    // 외부 입력에 대한 모의 서버의 거절 응답도 HTTP 경계를 통해 검증함.
    await expect(patchMemberSettings(body as never)).rejects.toMatchObject({
      status: 400,
    });
    expect(await getMemberSettings()).toEqual({ language: null, volume: 0.5 });
  });

  it('서버 오류를 기본 설정으로 바꾸지 않는다', async () => {
    server.use(
      http.get('/api/member/settings', () =>
        HttpResponse.json({ message: '실패' }, { status: 500 }),
      ),
    );
    await expect(getMemberSettings()).rejects.toMatchObject({
      status: 500,
      data: { message: '실패' },
    });
  });

  it('인증 없는 모의 설정 요청을 거절한다', async () => {
    // 인증 interceptor의 재발급·이동 부수 효과 없이 핸들러 권한을 검증함.
    const response = await fetch('/api/member/settings');
    expect(response.status).toBe(401);
  });

  it.each(['GET', 'PATCH'])(
    '%s 검사 직후 계정이 바뀌면 다른 계정 토큰으로 전송하지 않는다',
    async (method) => {
      const sent = vi.fn();
      const handler = ({ request }: { request: Request }) => {
        sent(request.headers.get('Authorization'));
        return HttpResponse.json({ language: 'en', volume: 0.8 });
      };
      server.use(
        http.get('/api/member/settings', handler),
        http.patch('/api/member/settings', handler),
      );
      const pending =
        method === 'GET'
          ? getMemberSettings()
          : patchMemberSettings({ volume: 0.8 });
      const rejected = pending.then(
        () => false,
        () => true,
      );
      localStorage.setItem('memberId', '2');
      localStorage.setItem('accessToken', 'token-b');
      expect(await rejected).toBe(true);
      expect(sent).not.toHaveBeenCalled();
      expect(localStorage.getItem('accessToken')).toBe('token-b');
    },
  );

  it('늦은 조회 응답도 다른 계정으로 전환한 뒤에는 반환하지 않는다', async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    const received = vi.fn();
    server.use(
      http.get('/api/member/settings', async () => {
        received();
        await gate;
        return HttpResponse.json({ language: 'ko', volume: 0.3 });
      }),
    );
    const rejected = getMemberSettings().then(
      () => false,
      () => true,
    );
    await vi.waitFor(() => expect(received).toHaveBeenCalledTimes(1));
    localStorage.setItem('memberId', '2');
    localStorage.setItem('accessToken', 'token-b');
    release();
    expect(await rejected).toBe(true);
  });

  it.each(['success', 'failure'])(
    '401 재발급 중 계정 전환 후 %s가 도착해도 재전송·인증 변경을 하지 않는다',
    async (result) => {
      const sent = vi.fn();
      server.use(
        http.patch('/api/member/settings', () => {
          sent();
          return HttpResponse.json(null, { status: 401 });
        }),
      );
      let release!: () => void;
      const gate = new Promise<void>((resolve) => {
        release = resolve;
      });
      const refresh = vi.spyOn(axios, 'post').mockImplementation(async () => {
        await gate;
        if (result === 'failure') {
          throw new Error('재발급 실패');
        }
        return { headers: { authorization: 'Bearer refreshed-other-token' } };
      });
      const rejected = patchMemberSettings({ volume: 0.8 }).then(
        () => false,
        () => true,
      );
      await vi.waitFor(() => expect(refresh).toHaveBeenCalledTimes(1));
      localStorage.setItem('memberId', '2');
      localStorage.setItem('accessToken', 'token-b');
      release();
      expect(await rejected).toBe(true);
      expect(sent).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('accessToken')).toBe('token-b');
      expect(localStorage.getItem('memberId')).toBe('2');
    },
  );

  it('동일 계정의 정상 재발급은 새 토큰으로 한 번 재시도한다', async () => {
    const tokens: Array<string | null> = [];
    server.use(
      http.patch('/api/member/settings', ({ request }) => {
        tokens.push(request.headers.get('Authorization'));
        return tokens.length === 1
          ? HttpResponse.json(null, { status: 401 })
          : HttpResponse.json({ language: null, volume: 0.8 });
      }),
    );
    vi.spyOn(axios, 'post').mockResolvedValue({
      headers: { authorization: 'Bearer refreshed-a' },
    });
    expect(await patchMemberSettings({ volume: 0.8 })).toEqual({
      language: null,
      volume: 0.8,
    });
    expect(tokens).toEqual(['settings-account-a', 'refreshed-a']);
    expect(localStorage.getItem('memberId')).toBe('1');
  });
});
