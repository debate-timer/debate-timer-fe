import { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import UpdateModalWrapper from '../../components/UpdateModal/UpdateModalWrapper';
import TableListPageContent from './components/TableListPageContent';

export default function TableListPage() {
  const { t } = useTranslation();
  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <Suspense fallback={<LoadingIndicator />}>
          <h1 className="m-5 mb-0 text-ui-headline">
            {t('토론 시간표를 선택해주세요')}
          </h1>
          <TableListPageContent />
        </Suspense>
        <Suspense>
          <UpdateModalWrapper />
        </Suspense>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
