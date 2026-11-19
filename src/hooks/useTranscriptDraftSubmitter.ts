import { useEffect } from 'react';
import { postTranscript } from '../apis/apis/transcript';
import {
  clearTranscriptDraft,
  countPendingSegments,
  EndedTranscriptDraft,
  hasDraftUtterances,
  isTranscriptDraftCurrent,
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

// 제출 중인 초안과 실패 기록. StrictMode나 중복 마운트에서도 한 초안을 한 번만 보내도록 모듈에 둔다.
const inFlightDraftIds = new Set<string>();
const attempts = new Map<string, SubmitAttempt>();

export interface UseTranscriptDraftSubmitterOptions {
  retryDelaysMs?: number[];
}

/**
 * 토론을 끝낸 기록 초안을 앱이 떠 있는 동안 서버로 보낸다.
 * 종료 화면을 바로 떠나도 Soniox 전사가 끝나면 이어서 제출하고, 실패하면 간격을 두고 다시 보낸다.
 * 자동 재시도까지 실패한 현재 초안은 실패로 표시하고 종료 화면의 다시 시도를 기다린다.
 * 새 기록 시작으로 보관한 초안은 다시 시도할 화면이 없으므로 마지막 간격으로 계속 보낸다.
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

    const submit = ({ context, draft, isCurrent }: EndedTranscriptDraft) => {
      inFlightDraftIds.add(draft.draftId);
      postTranscript(
        context.tableId,
        { segments: toSpeechSegments(draft), sttMode: draft.sttMode },
        context.memberId
          ? {
              expectedMemberId: context.memberId,
              expectedAuthRevision: context.authRevision,
            }
          : {},
      )
        .then(({ id }) => {
          attempts.delete(draft.draftId);
          if (!isTranscriptDraftCurrent(context)) {
            return;
          }
          setSubmittedTranscriptId(context, id);
          clearTranscriptDraft(context);
        })
        .catch(() => {
          const failures = (attempts.get(draft.draftId)?.failures ?? 0) + 1;
          if (failures > retryDelaysMs.length && isCurrent) {
            attempts.delete(draft.draftId);
            setTranscriptSubmitFailed(context, true);
            return;
          }
          const delayMs =
            retryDelaysMs[Math.min(failures, retryDelaysMs.length) - 1] ??
            CHECK_INTERVAL_MS;
          attempts.set(draft.draftId, {
            failures,
            nextAt: Date.now() + delayMs,
          });
        })
        .finally(() => {
          inFlightDraftIds.delete(draft.draftId);
          scheduleCheck(0);
        });
    };

    function check() {
      checkTimer = null;
      const now = Date.now();
      let isWaiting = false;
      for (const ended of listEndedTranscriptDrafts()) {
        const { context, draft } = ended;
        if (draft.isSubmitFailed) {
          continue;
        }
        // 다시 연결된 effect도 이전 effect가 시작한 요청이 끝난 뒤 재시도를 확인하도록 기다린다.
        if (inFlightDraftIds.has(draft.draftId)) {
          isWaiting = true;
          continue;
        }
        if (countPendingSegments(draft, now) > 0) {
          isWaiting = true;
          continue;
        }
        if (!hasDraftUtterances(draft)) {
          clearTranscriptDraft(context);
          continue;
        }
        const attempt = attempts.get(draft.draftId);
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
    window.addEventListener('auth-changed', handleChange);
    scheduleCheck(0);
    return () => {
      isActive = false;
      if (checkTimer !== null) {
        clearTimeout(checkTimer);
      }
      window.removeEventListener(TRANSCRIPT_DRAFT_CHANGE_EVENT, handleChange);
      window.removeEventListener('auth-changed', handleChange);
    };
  }, [retryDelaysMs]);
}
