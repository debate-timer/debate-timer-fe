import { PropsWithChildren } from 'react';
import {
  SettingsContext,
  useSettingsState,
} from '../../hooks/useGlobalSettings';
/** 앱 수명의 적용값과 저장 큐를 조립함. */
export default function GlobalSettingsProvider(props: PropsWithChildren) {
  const { children } = props;
  const value = useSettingsState();
  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}
