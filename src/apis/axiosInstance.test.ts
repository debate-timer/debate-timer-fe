import axios from 'axios';
import { http, HttpResponse } from 'msw';
import { server } from '../mocks/server';
import { axiosInstance } from './axiosInstance';

describe('axiosInstance 응답 인터셉터', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('401 응답을 받으면 refresh token 쿠키가 실리도록 withCredentials를 켜고 재발급을 요청한다', async () => {
    server.use(
      http.get('*/api/reissue-target', () =>
        HttpResponse.json(null, { status: 401 }),
      ),
    );
    const postSpy = vi
      .spyOn(axios, 'post')
      .mockRejectedValue(new Error('reissue failed'));

    await expect(axiosInstance.get('/api/reissue-target')).rejects.toThrow(
      'reissue failed',
    );

    expect(postSpy).toHaveBeenCalledWith(
      expect.stringContaining('/api/member/reissue'),
      null,
      expect.objectContaining({ withCredentials: true }),
    );
  });
});
