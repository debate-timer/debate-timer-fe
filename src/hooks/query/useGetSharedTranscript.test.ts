import { APIError } from '../../apis/primitives';
import { GetSharedTranscriptResponseType } from '../../apis/responses/transcript';
import { getSharedTranscriptRefetchInterval } from './useGetSharedTranscript';

const processing = {
  status: 'PROCESSING',
  refining: false,
} as GetSharedTranscriptResponseType;

describe('공유 기록 재조회 주기', () => {
  it('생성 중이면 주기적으로 다시 조회한다', () => {
    expect(getSharedTranscriptRefetchInterval(processing, null)).toBe(2000);
  });

  it('생성이 끝나면 다시 조회하지 않는다', () => {
    expect(
      getSharedTranscriptRefetchInterval(
        { ...processing, status: 'DONE' },
        null,
      ),
    ).toBe(false);
  });

  it('생성 중에 받은 응답이 남아 있어도 공유가 중지(404)되면 다시 조회하지 않는다', () => {
    expect(
      getSharedTranscriptRefetchInterval(
        processing,
        new APIError('Not Found', 404, null),
      ),
    ).toBe(false);
  });

  it('일시적인 오류면 생성 중 재조회를 이어간다', () => {
    expect(
      getSharedTranscriptRefetchInterval(
        processing,
        new APIError('Server Error', 500, null),
      ),
    ).toBe(2000);
  });
});
