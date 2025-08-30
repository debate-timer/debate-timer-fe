import { DebateTemplate } from '../../../type/type';

export default function TemplateCard({
  title,
  subtitle,
  logoSrc,
  actions,
  className,
}: DebateTemplate) {
  return (
    <article
      className={[
        // 카드 컨테이너
        'flex flex-col rounded-3xl border-white border-4 bg-gradient-to-b from-default-white to-brand',
        'ring-3 ring-brand/20',
        'shadow-[0_0_32px_rgba(255,165,0,0.1)] p-6 md:p-7',
        className ?? '',
      ].join(' ')}
    >
      {/* 헤더 */}
      <div className=" flex justify-between">
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
        {actions.map((a, i) => (
          <li key={`${a.label}-${i}`}>
            <div className=" flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2">
              <span className="truncate text-[min(max(0.75rem,1.1vw),0.9rem)] font-medium text-neutral-800 ">
                {a.label}
              </span>

              <a
                href={a.href}
                className={[
                  'shrink-0 rounded-full px-4 py-1.5',
                  'text-[min(max(0.75rem,1.1vw),0.9rem)] font-medium',
                  'bg-brand text-default-black border border-neutral-300',
                  'transition-colors duration-100 hover:bg-semantic-table hover:text-white',
                ].join(' ')}
                aria-label={`${a.label} 토론하기`}
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
