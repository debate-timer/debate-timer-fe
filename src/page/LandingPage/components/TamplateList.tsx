import { DebateTemplate } from '../../../type/type';
import TemplateCard from './TemplateCard';

interface TamplateListProps {
  data: DebateTemplate[];
}
export default function TamplateList({ data }: TamplateListProps) {
  return (
    <div
      className={[
        'grid gap-5',
        // 작은 화면 1열, md에서 2열, xl에서 3열
        'grid-cols-2 lg:grid-cols-3',
      ].join(' ')}
    >
      {data.map((t) => (
        <TemplateCard key={t.title} {...t} />
      ))}
    </div>
  );
}
