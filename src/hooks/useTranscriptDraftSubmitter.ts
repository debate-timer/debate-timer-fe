import { useEffect } from 'react';
import { postTranscript } from '../apis/apis/transcript';
import {
  clearTranscriptDraft,
  countPendingSegments,
  EndedTranscriptDraft,
  hasDraftUtterances,
  isSameTranscriptDraft,
  listEndedTranscriptDrafts,
  setSubmittedTranscriptId,
  setTranscriptSubmitFailed,
  toSpeechSegments,
  TRANSCRIPT_DRAFT_CHANGE_EVENT,
} from '../util/transcriptDraft';

// 실패한 제출을 자동으로 다시 보내기 전에 기다리는 시간. 모두 실패하면 사용자의 다시 시도를 기다린다.
const DEFAULT_RETRY_DELAYS_MS = [2_000, 5_000, 15_000];
// 전사 대기 만료와 재시도 시각을 확인하는 주기
const CHECK_INTERVAL_MS = 1_000;

interface SubmitAttempt {
  failures: number;
  nextAt: number;
}

// 초안에 ID가 없어 테이블과 시작 시각으로 구분한다.
const toDraftKey = ({ tableId, draft }: EndedTranscriptDraft) =>
  `${tableId}:${draft.startedAt}`;

// 제출 중인 초안과 실패 기록. StrictMode나 중복 마운트에서도 한 초안을 한 번만 보내도록 모듈에 둔다.
const inFlightDraftKeys = new Set<string>();
const attempts = new Map<string, SubmitAttempt>();

export interface UseTranscriptDraftSubmitterOptions {
  retryDelaysMs?: number[];
}

/**
 * 토론을 끝낸 기록 초안을 앱이 떠 있는 동안 서버로 보낸다.
 * 종료 화면을 바로 떠나도 Soniox 전사가 끝나면 이어서 제출하고, 실패하면 간격을 두고 다시 보낸다.
 * 자동 재시도까지 실패한 초안은 실패로 표시하고 종료 화면의 다시 시도를 기다린다.
 * 앱 수명에 한 번만 연결한다.
 */
export default function useTranscriptDraftSubmitter(
  options: UseTranscriptDraftSubmitterOptions = {},
) {
  const { retryDelaysMs = DEFAULT_RETRY_DELAYS_MS } = options;

  useEffect(() => {
    let isActive = true;
    let checkTimer: ReturnType<typeof setTimeout> | null = null;

    // 초안 변경 이벤트가 한 번에 여러 번 와도 한 번만 확인한다.
    const scheduleCheck = (delayMs: number) => {
      if (!isActive) {
        return;
      }
      if (checkTimer !== null) {
        clearTimeout(checkTimer);
      }
      checkTimer = setTimeout(check, delayMs);
    };
    const handleChange = () => scheduleCheck(0);

    const submit = (ended: EndedTranscriptDraft) => {
      const { tableId, draft } = ended;
      const key = toDraftKey(ended);
      inFlightDraftKeys.add(key);
      postTranscript(tableId, {
        segments: toSpeechSegments(draft),
        sttMode: draft.sttMode,
      })
        .then(({ id }) => {
          attempts.delete(key);
          // 제출 중 같은 테이블로 새 기록을 시작했으면 새 초안을 지우지 않는다.
          if (!isSameTranscriptDraft(tableId, draft.startedAt)) {
            return;
          }
          setSubmittedTranscriptId(tableId, id);
          clearTranscriptDraft(tableId);
        })
        .catch(() => {
          const failures = (attempts.get(key)?.failures ?? 0) + 1;
          if (failures > retryDelaysMs.length) {
            attempts.delete(key);
            setTranscriptSubmitFailed(tableId, draft.startedAt, true);
            return;
          }
          attempts.set(key, {
            failures,
            nextAt: Date.now() + retryDelaysMs[failures - 1],
          });
        })
        .finally(() => {
          inFlightDraftKeys.delete(key);
          scheduleCheck(0);
        });
    };

    function check() {
      checkTimer = null;
      const now = Date.now();
      let isWaiting = false;
      for (const ended of listEndedTranscriptDrafts()) {
        const { tableId, draft } = ended;
        const key = toDraftKey(ended);
        if (draft.isSubmitFailed) {
          continue;
        }
        // 다시 연결된 effect도 이전 effect가 시작한 요청이 끝난 뒤 재시도를 확인하도록 기다린다.
        if (inFlightDraftKeys.has(key)) {
          isWaiting = true;
          continue;
        }
        if (countPendingSegments(draft, now) > 0) {
          isWaiting = true;
          continue;
        }
        if (!hasDraftUtterances(draft)) {
          clearTranscriptDraft(tableId);
          continue;
        }
        const attempt = attempts.get(key);
        if (attempt && attempt.nextAt > now) {
          isWaiting = true;
          continue;
        }
        submit(ended);
      }
      // 전사 대기 만료와 재시도 시각은 이벤트 없이 오므로 기다릴 초안이 있으면 다시 확인한다.
      if (isWaiting) {
        scheduleCheck(Math.min(CHECK_INTERVAL_MS, ...retryDelaysMs));
      }
    }

    window.addEventListener(TRANSCRIPT_DRAFT_CHANGE_EVENT, handleChange);
    scheduleCheck(0);
    return () => {
      isActive = false;
      if (checkTimer !== null) {
        clearTimeout(checkTimer);
      }
      window.removeEventListener(TRANSCRIPT_DRAFT_CHANGE_EVENT, handleChange);
    };
  }, [retryDelaysMs]);
}
