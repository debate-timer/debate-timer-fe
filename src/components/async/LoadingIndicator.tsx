import LoadingSpinner from '../LoadingSpinner';

interface LoadingIndicatorProps {
  message?: string;
}

export default function LoadingIndicator({
  message = '데이터를 불러오고 있습니다...',
}: LoadingIndicatorProps) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center space-y-8 p-16">
      <LoadingSpinner size="size-32" color="text-neutral-500" />
      <p className="text-xl">{message}</p>
    </div>
  );
}
