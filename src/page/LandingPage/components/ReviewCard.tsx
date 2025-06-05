import { ReactNode } from 'react';
import reviewIcon from '../../../assets/landing/review-icon.svg';

interface ReviewCardProps {
  quote: string;
  content: ReactNode;
  user: string;
}

export default function ReviewCard({ quote, content, user }: ReviewCardProps) {
  return (
    <div className="flex min-h-[300px] w-[30%] flex-col rounded-[32px] bg-neutral-100 p-6">
      <div className="mb-4 text-[min(max(0.875rem,1.25vw),1.2rem)] font-medium leading-snug">
        “{quote}”
      </div>
      <div className="mb-auto whitespace-pre-line text-[min(max(0.75rem,1.1vw),1.1rem)] text-neutral-500">
        {content}
      </div>
      <div className="mt-8 flex items-center gap-2">
        <img
          src={reviewIcon}
          alt="reviewIcon"
          className="w-7 rounded-full border"
        />
        <span className="text-[min(max(0.75rem,1.1vw),1.1rem)] text-neutral-500">
          {user}
        </span>
      </div>
    </div>
  );
}
