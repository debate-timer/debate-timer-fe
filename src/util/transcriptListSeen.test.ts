import {
  getTranscriptListSeenAt,
  hasUnseenTranscripts,
  markTranscriptListSeen,
} from './transcriptListSeen';

const at = (createdAt: string) => ({ createdAt });

describe('토론 기록 탭 새 기록 표시', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('토론 기록 탭을 한 번도 열지 않았으면 기록이 없어도 새로 표시한다', () => {
    expect(hasUnseenTranscripts([], getTranscriptListSeenAt())).toBe(true);
  });

  it('마지막으로 본 기록보다 나중에 만들어진 기록이 있으면 새로 표시한다', () => {
    markTranscriptListSeen([at('2026-10-23T22:28:38.315786')]);

    expect(
      hasUnseenTranscripts(
        [at('2026-10-23T22:40:00'), at('2026-10-23T22:28:38.315786')],
        getTranscriptListSeenAt(),
      ),
    ).toBe(true);
  });

  it('모든 기록을 봤으면 새로 표시하지 않는다', () => {
    markTranscriptListSeen([
      at('2026-10-23T22:28:38.315786'),
      at('2026-10-22T20:10:00'),
    ]);

    expect(
      hasUnseenTranscripts(
        [at('2026-10-23T22:28:38.315786'), at('2026-10-22T20:10:00')],
        getTranscriptListSeenAt(),
      ),
    ).toBe(false);
  });

  it('기록이 없을 때 탭을 열었으면 이후 기록이 생기기 전까지 새로 표시하지 않는다', () => {
    markTranscriptListSeen([]);

    expect(hasUnseenTranscripts([], getTranscriptListSeenAt())).toBe(false);
    expect(
      hasUnseenTranscripts(
        [at('2026-10-23T22:40:00')],
        getTranscriptListSeenAt(),
      ),
    ).toBe(true);
  });

  it('저장소를 쓸 수 없으면 본 적 없는 것으로 다룬다', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new Error('blocked');
    });

    expect(getTranscriptListSeenAt()).toBeNull();
  });
});
