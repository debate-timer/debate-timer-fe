import { useTranslation } from 'react-i18next';
import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import CheckBox from '../../components/icons/CheckBox';

export default function VoteCompletePage() {
  const { t } = useTranslation();
  return (
    <DefaultLayout>
      <DefaultLayout.ContentContainer>
        <main className="flex min-h-screen items-center justify-center bg-white">
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
        </main>
      </DefaultLayout.ContentContainer>
    </DefaultLayout>
  );
}
