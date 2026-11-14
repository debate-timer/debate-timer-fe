import { http, HttpResponse } from 'msw';
import { ApiUrl } from '../../apis/endpoints';
import { GetMemberSettingsResponseType } from '../../apis/responses/member';
import { isSupportedLang } from '../../util/languageRouting';

const MEMBER_SETTINGS = new Map<string, GetMemberSettingsResponseType>();

/** 테스트 사이에 모의 계정 설정이 남지 않도록 초기화함. */
export function resetMemberSettings(): void {
  MEMBER_SETTINGS.clear();
}

function getSettings(token: string): GetMemberSettingsResponseType {
  return MEMBER_SETTINGS.get(token) ?? { language: null, volume: 0.5 };
}

function isSettingsPatch(value: unknown): value is {
  language?: 'ko' | 'en' | null;
  volume?: number | null;
} {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }
  const body = value as Record<string, unknown>;
  if (body.language == null && body.volume == null) {
    return false;
  }
  if (
    'language' in body &&
    body.language !== null &&
    (typeof body.language !== 'string' || !isSupportedLang(body.language))
  ) {
    return false;
  }
  if (
    'volume' in body &&
    body.volume !== null &&
    (typeof body.volume !== 'number' ||
      !Number.isFinite(body.volume) ||
      body.volume < 0 ||
      body.volume > 1)
  ) {
    return false;
  }
  return true;
}

export const memberHandlers = [
  http.get(ApiUrl.memberSettings, ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: '인증이 필요함' }, { status: 401 });
    }
    return HttpResponse.json(getSettings(token));
  }),
  http.patch(ApiUrl.memberSettings, async ({ request }) => {
    const token = request.headers.get('Authorization');
    if (!token) {
      return HttpResponse.json({ message: '인증이 필요함' }, { status: 401 });
    }
    const body: unknown = await request.json().catch(() => null);
    if (!isSettingsPatch(body)) {
      return HttpResponse.json(
        { message: '잘못된 설정 요청' },
        { status: 400 },
      );
    }
    const previous = getSettings(token);
    const settings: GetMemberSettingsResponseType = {
      language: body.language ?? previous.language,
      volume:
        body.volume == null
          ? previous.volume
          : Math.round(body.volume * 10) / 10,
    };
    MEMBER_SETTINGS.set(token, settings);
    return HttpResponse.json(settings);
  }),
  // GET /api/member/feature-flags
  // 개발 모드에서는 모든 기능을 볼 수 있도록 전부 내려준다.
  http.get(`${ApiUrl.member}/feature-flags`, () => {
    return HttpResponse.json({ featureFlags: ['TRANSCRIPT'] });
  }),

  // POST "/api/member"
  http.post(ApiUrl.member, async () => {
    return HttpResponse.json({
      id: 1,
      nickname: '홍길동',
    });
  }),

  // GET /api/table?memberId={memberId}
  http.get(ApiUrl.table, ({ request }) => {
    const url = new URL(request.url);
    const memberId = url.searchParams.get('memberId');
    console.log(`# memberId = ${memberId}`);

    return HttpResponse.json({
      tables: [
        {
          id: 1,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 2,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
        {
          id: 3,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 4,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
        {
          id: 5,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 6,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
        {
          id: 7,
          name: '테이블 1',
          type: 'PARLIAMENTARY',
          duration: '1800',
        },
        {
          id: 8,
          name: '테이블 2',
          type: 'PARLIAMENTARY',
          duration: '1750',
        },
      ],
    });
  }),
];
