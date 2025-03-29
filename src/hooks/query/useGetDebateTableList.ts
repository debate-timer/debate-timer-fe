import { useQuery } from '@tanstack/react-query';
import { getDebateTableList } from '../../apis/apis/member';

export function useGetDebateTableList() {
  return useQuery({
    queryKey: ['DebateTableList'],
    queryFn: () => getDebateTableList(),
  });
}
