import { ReactNode } from 'react';
import reviewIcon from '../../../../public/landing/review-icon.svg';

interface ReviewCardProps {
  quote: string;
  content: ReactNode;
  user: string;
}

export default function ReviewCard({ quote, content, user }: ReviewCardProps) {
  return (
    <div className="flex min-h-[300px] w-[30%] flex-col rounded-[32px] bg-neutral-100 p-6">
      <div className="mb-4 text-[1.25vw] font-medium leading-snug">
        “{quote}”
      </div>
      <div className="mb-auto whitespace-pre-line text-[1.1vw] text-neutral-500">
        {content}
      </div>
      <div className="mt-8 flex items-center gap-2">
        <img
          src={reviewIcon}
          alt="reviewIcon"
          className="w-7 rounded-full border"
        />
        <span className="text-[1.1vw] text-neutral-500">{user}</span>
      </div>
    </div>
  );
}
