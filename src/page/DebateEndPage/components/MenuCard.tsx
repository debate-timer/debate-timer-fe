// src/components/MenuCard/MenuCard.tsx
import clsx from 'clsx';

type MenuCardProps = {
  title: string;
  description?: string;
  imgSrc: string;
  imgAlt?: string;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
};

const titleSize = 'text-lg md:text-xl lg:text-2xl xl:text-title-raw';
const descSize = 'text-sm md:text-base lg:text-lg xl:text-detail-raw';

export default function MenuCard({
  title,
  description,
  imgSrc,
  imgAlt = '',
  onClick,
  className,
  ariaLabel,
}: MenuCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={clsx(
        'flex h-[280px] w-[280px] flex-col items-center justify-center gap-6 ',
        'rounded-[34px] border-2 border-default-disabled/hover bg-white ',
        'transition-all duration-300 hover:border-brand/40 ',
        'hover:shadow-[0px_0px_22px_6px_#FECD4C63] ',
        'md:h-[300px] md:w-[300px] lg:h-[340px] lg:w-[340px] ',
        'xl:h-[370px] xl:w-[370px] xl:gap-11',
        className,
      )}
      aria-label={ariaLabel ?? title}
    >
      <img
        src={imgSrc}
        alt={imgAlt}
        className={
          'h-20 w-20 md:h-24 md:w-24 lg:h-[96px] lg:w-[96px] xl:h-[108px] xl:w-[108px]'
        }
      />
      <div className="text-center">
        <p className={clsx('font-semibold text-default-black', titleSize)}>
          {title}
        </p>
        {description && (
          <p className={clsx('text-default-border', descSize)}>{description}</p>
        )}
      </div>
    </button>
  );
}
