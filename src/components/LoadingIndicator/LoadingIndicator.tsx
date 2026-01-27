import { useTranslation } from 'react-i18next';
import { PropsWithChildren } from 'react';
import LoadingSpinner from '../LoadingSpinner';

export default function LoadingIndicator({ children }: PropsWithChildren) {
  const { t } = useTranslation();
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-8 p-16">
      <LoadingSpinner size="size-32" color="text-neutral-500" />
      <p className="text-xl">
        {children ?? t('데이터를 불러오고 있습니다...')}
      </p>
    </div>
  );
}
