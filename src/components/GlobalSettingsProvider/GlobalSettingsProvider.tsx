import { PropsWithChildren } from 'react';
import {
  SettingsContext,
  useSettingsState,
} from '../../hooks/useGlobalSettings';
/**
 * 앱 수명의 적용값과 저장 큐를 조립함.
 *
 * `GlobalSettingsProvider`가 앱 수명의 적용값·대기 저장·실패 상태를 소유함. `useGlobalSettings`로 헤더·모달·종소리가 공유하며 모달을 닫아도 저장 수명은 유지함. 직접 선택의 직렬 저장은 `SettingsController`가 담당함.
 *
 */
export default function GlobalSettingsProvider(props: PropsWithChildren) {
  const { children } = props;
  const value = useSettingsState();
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
