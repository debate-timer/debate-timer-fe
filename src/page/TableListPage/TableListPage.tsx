import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import HeaderTitle from '../../components/HeaderTitle/HeaderTitle';
import { Suspense } from 'react';
import LoadingIndicator from '../../components/LoadingIndicator/LoadingIndicator';
import TableListPageContent from './components/TableListPageContent';

export default function TableListPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.Header>
        <DefaultLayout.Header.Left />
        <DefaultLayout.Header.Center>
          <HeaderTitle title="토론 시간표를 선택해주세요" />
        </DefaultLayout.Header.Center>
        <DefaultLayout.Header.Right />
      </DefaultLayout.Header>

      <DefaultLayout.ContentContainer>
        <Suspense fallback={<LoadingIndicator />}>
          <TableListPageContent />
        </Suspense>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
