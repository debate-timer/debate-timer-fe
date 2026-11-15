import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { useModal } from '../../../hooks/useModal';
import DialogModal from '../../../components/DialogModal/DialogModal';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';
import { IoHomeSharp } from 'react-icons/io5';

interface TimerDashboardButtonProps {
  className: string;
}

/**
 * 타이머 헤더의 대시보드 이동 버튼. 외형은 헤더에서 전달하고 확인 후에만 이동함.
 * useModal이 포커스와 닫기를 관리하며 기존 라우트 이탈 보호와 인증 정책을 유지함.
 */
export default function TimerDashboardButton(props: TimerDashboardButtonProps) {
  const { className } = props;
  const { t } = useTranslation();
  const { lang } = useParams();
  const navigate = useNavigate();
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const message = t('토론이 진행 중입니다. 이탈하시겠습니까?');
  const handleConfirm = () => {
    closeModal();
    navigate(
      buildLangPath('/dashboard', isSupportedLang(lang) ? lang : DEFAULT_LANG),
    );
  };

  return (
    <>
      <button
        type="button"
        className={className}
        aria-label={t('대시보드')}
        onClick={openModal}
      >
        <IoHomeSharp className="size-6" aria-hidden="true" />
      </button>
      <ModalWrapper aria-label={message}>
        <div data-timer-overlay>
          <DialogModal
            left={{ text: t('취소'), onClick: closeModal }}
            right={{ text: t('확인'), onClick: handleConfirm, isBold: true }}
          >
            <p className="p-6 text-center text-ui-body">{message}</p>
          </DialogModal>
        </div>
      </ModalWrapper>
    </>
  );
}
