// components/FirstUseToolTipModal.tsx
import { ComponentType, ReactNode } from 'react';
import FirstUseToolTip from '../components/FirstUseToolTip';

interface Props {
  Wrapper: ComponentType<{ children: ReactNode }>;
  onClose: () => void;
}
export function FirstUseToolTipModal({ Wrapper, onClose }: Props) {
  return (
    <Wrapper>
      <FirstUseToolTip onClose={onClose} />
    </Wrapper>
  );
}
