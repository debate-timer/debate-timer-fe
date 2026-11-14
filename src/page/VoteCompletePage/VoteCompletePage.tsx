import { useSearchParams } from 'react-router-dom';
import useGetCompletionInfo from '../../hooks/query/useGetCompletionInfo';
import AudienceHeaderContainer from '../../layout/components/header/AudienceHeaderContainer';
import { parsePositiveId } from '../../util/headerNavigation';
import CompletionInfoNotice from '../../components/CompletionInfoNotice/CompletionInfoNotice';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import CheckBox from '../../components/icons/CheckBox';

export default function VoteCompletePage() {
  const { t } = useTranslation();
  const [search] = useSearchParams();
  const info = useGetCompletionInfo(
    'poll',
    parsePositiveId(search.get('pollId')),
  );
  return (
    <DefaultLayout
      header={
        <AudienceHeaderContainer
          name={info.data?.name}
          agenda={info.data?.agenda}
        />
      }
    >
      <DefaultLayout.ContentContainer>
        <CompletionInfoNotice
          isError={info.isError}
          isFetching={info.isFetching}
          onRetry={() => void info.refetch()}
        />
        <div className="flex w-full flex-1 items-center justify-center bg-white">
          <div className="flex flex-col items-center gap-4 text-center">
            {/* 체크 아이콘 배지 */}
            <CheckBox
              className="bg-brand text-white"
              checked={true}
              size={'4vw'}
            />

            {/* 완료 메시지 */}
            <h2 className="text-[min(max(1.25rem,3.5vw),3rem)] font-bold">
              {t('투표가 완료되었습니다.')}
            </h2>
          </div>
        </div>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
