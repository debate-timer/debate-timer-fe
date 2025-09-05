import { DebateTemplate } from '../../../type/type';
import TemplateCard from './TemplateCard';

interface TemplateListProps {
  data: DebateTemplate[];
}
export default function TemplateList({ data }: TemplateListProps) {
  return (
    <div
      className={'grid grid-cols-2 gap-5 lg:grid-cols-3'} // 2열, lg에서 3열
    >
      {data.map((template) => (
        <TemplateCard key={template.title} {...template} />
      ))}
    </div>
  );
}
