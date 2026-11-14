import { useTranslation } from 'react-i18next';
import DialogModal from '../../../components/DialogModal/DialogModal';

export const RECORDING_CONSENT_TITLE_ID = 'recording-consent-title';
export const RECORDING_CONSENT_DESCRIPTION_ID = 'recording-consent-description';

interface RecordingConsentDialogProps {
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * 공유 화면의 청중에게 다기기 녹음 참여 전 녹음 사실과 쓰임새를 알리고 동의를 받는 본문과 버튼을 표시함.
 *
 * 동의하면 `onConfirm`, 거절하면 `onCancel`을 실행하며 거절해도 공유 화면 보기는 계속됨. 문구는 기획 확정 전 기본 고지이며 번역 키로 관리함.
 * 열림·닫힘, 오버레이, 대화상자 역할과 포커스 관리는 상위 모달 컨테이너가 소유함. 컨테이너는 `RECORDING_CONSENT_TITLE_ID`·`RECORDING_CONSENT_DESCRIPTION_ID`로 이름과 설명을 연결함.
 */
export default function RecordingConsentDialog(
  props: RecordingConsentDialogProps,
) {
  const { onConfirm, onCancel } = props;
  const { t } = useTranslation();

  return (
    <DialogModal
      left={{ text: t('참여하지 않기'), onClick: onCancel }}
      right={{ text: t('동의하고 참여'), onClick: onConfirm, isBold: true }}
    >
      <div className="flex flex-col gap-3 px-6 pt-6 pb-2">
        <h2 id={RECORDING_CONSENT_TITLE_ID} className="text-ui-title">
          {t('토론 녹음에 참여할까요?')}
        </h2>
        <div
          id={RECORDING_CONSENT_DESCRIPTION_ID}
          className="flex flex-col gap-2"
        >
          <p>
            {t('이 기기의 마이크로 발언을 녹음해 속기록을 만드는 데 씁니다.')}
          </p>
          <p>
            {t(
              '여러 기기의 녹음 중 가장 깨끗한 녹음만 서버에 보관하고 글로 바꿉니다.',
            )}
          </p>
          <p>{t('주변의 대화도 함께 녹음될 수 있습니다.')}</p>
        </div>
      </div>
    </DialogModal>
  );
}
