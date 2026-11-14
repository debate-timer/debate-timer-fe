import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TranscriptListContent from './TranscriptListContent';

export default function RecordsPage() {
  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <TranscriptListContent />
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
