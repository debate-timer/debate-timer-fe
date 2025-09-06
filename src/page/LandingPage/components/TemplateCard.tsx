import { DebateTemplate } from '../../../type/type';
import clsx from 'clsx';

export default function TemplateCard({
  title,
  subtitle,
  logoSrc,
  actions,
  className,
}: DebateTemplate) {
  return (
    <article
      className={clsx(
        'flex flex-col rounded-3xl border-4 border-white bg-gradient-to-b from-default-white to-brand',
        'ring-3 ring-brand/20',
        'p-6 shadow-[0_0_32px_rgba(255,165,0,0.1)] md:p-7',
        className,
      )}
    >
      {/* 헤더 */}
      <div className="flex justify-between">
        <div className="flex flex-col gap-2">
          <h3 className="text-[min(max(0.9rem,1.4vw),1.1rem)] font-semibold leading-tight">
            {title}
          </h3>
          <p className="mt-1 min-h-[1.25rem] text-[min(max(0.75rem,1.1vw),0.9rem)] text-neutral-700">
            {subtitle ?? ''}
          </p>
        </div>

        {/* 로고 */}
        {logoSrc && (
          <img
            src={logoSrc}
            alt={`${title} 로고`}
            className="h-12 w-12 shrink-0 rounded-full object-contain"
          />
        )}
      </div>

      {/* 액션 리스트 */}
      <ul className="mt-5 flex flex-col gap-1">
        {actions.map((action, index) => (
          <li key={`${action.label}-${index}`}>
            <div className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
              <span className="truncate text-[min(max(0.75rem,1.1vw),0.9rem)] font-medium text-neutral-800">
                {action.label}
              </span>

              <a
                href={action.href}
                className="shrink-0 rounded-full border border-neutral-300 bg-brand px-4 py-1.5 text-[min(max(0.75rem,1.1vw),0.9rem)] font-medium text-default-black transition-colors duration-100 hover:bg-semantic-table hover:text-white"
                aria-label={`${action.label} 토론하기`}
              >
                토론하기
              </a>
            </div>
          </li>
        ))}
      </ul>
    </article>
  );
}
