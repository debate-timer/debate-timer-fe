import { http, HttpResponse } from 'msw';
import { server } from '../../mocks/server';
import { ApiUrl } from '../endpoints';
import { GetMemberFeatureFlagsResponseType } from '../responses/member';
import { getMemberFeatureFlags } from './member';

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
