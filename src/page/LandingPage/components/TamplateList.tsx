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
        // 2열, lg에서 3열
        'grid-cols-2 lg:grid-cols-3',
      ].join(' ')}
    >
      {data.map((t) => (
        <TemplateCard key={t.title} {...t} />
      ))}
    </div>
  );
}
