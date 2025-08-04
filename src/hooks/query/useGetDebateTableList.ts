import { useSuspenseQuery } from '@tanstack/react-query';
import { getDebateTableList } from '../../apis/apis/member';

export function useGetDebateTableList() {
  return useSuspenseQuery({
    queryKey: ['DebateTableList'],
    queryFn: () => getDebateTableList(),
  });
}
