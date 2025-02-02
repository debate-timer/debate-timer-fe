import { useQuery } from '@tanstack/react-query';
import { getDebateTableList } from '../../apis/apis';

export function useGetDebateTableList() {
  return useQuery({
    queryKey: ['DebateTableList'],
    queryFn: () => getDebateTableList(),
  });
}
