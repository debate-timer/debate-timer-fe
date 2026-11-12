import { patchMemberSettings } from '../apis/apis/member';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
} from 'react';
import { useQueryClient } from '@tanstack/react-query';
import useGetMemberSettings from './query/useGetMemberSettings';
import usePatchMemberSettings from './mutations/usePatchMemberSettings';
import {
  getAccessToken,
  getAuthRevision,
  getMemberId,
} from '../util/accessToken';
import {
  readGuestSettings,
  saveGuestSettings,
  SettingsController,
} from '../util/settingsController';
import { PatchMemberSettingsRequestType } from '../apis/requests/member';

function subscribeIdentity(listener: () => void) {
  window.addEventListener('auth-changed', listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener('auth-changed', listener);
    window.removeEventListener('storage', listener);
  };
}
function getIdentity() {
  try {
    return getAccessToken() ? getMemberId() : null;
  } catch {
    return null;
  }
}
export const SettingsContext = createContext<ReturnType<
  typeof useSettingsState
> | null>(null);
export function useSettingsState() {
  const revision = useSyncExternalStore(subscribeIdentity, getAuthRevision);
  const memberId = getIdentity();
  const client = useQueryClient();
  const query = useGetMemberSettings(memberId);
  const { mutateAsync } = usePatchMemberSettings(memberId);
  const controller = useMemo(
    () =>
      new SettingsController(
        async (changes) => {
          if (getIdentity() !== memberId || getAuthRevision() !== revision) {
            throw new Error('ACCOUNT_CHANGED');
          }
          return memberId
            ? mutateAsync(changes as PatchMemberSettingsRequestType)
            : saveGuestSettings(changes);
        },
        async (changes) => {
          if (getIdentity() !== memberId || getAuthRevision() !== revision) {
            throw new Error('ACCOUNT_CHANGED');
          }
          return memberId
            ? patchMemberSettings(changes as PatchMemberSettingsRequestType)
            : saveGuestSettings(changes);
        },
      ),
    [memberId, mutateAsync, revision],
  );
  const settings = useSyncExternalStore(
    controller.subscribe,
    controller.getSnapshot,
  );
  useEffect(() => {
    controller.activate();
    if (!memberId) {
      try {
        controller.load(readGuestSettings());
      } catch {
        /* 읽기 실패는 재시도 가능한 상태로 노출함. */ controller.fail();
      }
    }
    return () => {
      controller.dispose();
      if (
        (memberId && getIdentity() !== memberId) ||
        getAuthRevision() !== revision
      ) {
        void client.cancelQueries({ queryKey: ['MemberSettings', memberId] });
        client.removeQueries({ queryKey: ['MemberSettings', memberId] });
      }
    };
  }, [client, controller, memberId, revision]);
  useEffect(() => {
    if (query.data) {
      controller.load(query.data);
    }
  }, [controller, query.data]);
  return {
    ...settings,
    memberId,
    controller,
    loadStatus: query.status,
    retryLoad: query.refetch,
  };
}
/** 설정 소비자의 공용 진입점임. */
export default function useGlobalSettings() {
  const settings = useContext(SettingsContext);
  if (!settings) {
    throw new Error('GlobalSettingsProvider is required');
  }
  return settings;
}
