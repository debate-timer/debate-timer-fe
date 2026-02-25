import { Organization } from '../../../type/type';
import TemplateCard from './TemplateCard';

interface TemplateListProps {
  organizations: Organization[];
}

export default function TemplateList({ organizations }: TemplateListProps) {
  return (
    <div
      className={'grid grid-cols-2 gap-5 lg:grid-cols-3'} // 2열, lg에서 3열
    >
      {organizations.map((organization) => (
        <TemplateCard
          key={organization.organization}
          organization={organization}
        />
      ))}
    </div>
  );
}
