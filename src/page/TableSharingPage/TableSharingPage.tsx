import { useTranslation } from 'react-i18next';
import { useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import LoggedInStoreDBModal from './components/LoggedInStoreDBModal';
import { decodeDebateTableData } from '../../util/arrayEncoding';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DebateTableData } from '../../type/type';
import apiDebateTableRepository from '../../repositories/ApiDebateTableRepository';
import sessionDebateTableRepository from '../../repositories/SessionDebateTableRepository';
import { isLoggedIn } from '../../util/accessToken';
import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
} from '../../apis/responses/debateTable';
import { isGuestFlow } from '../../util/sessionStorage';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../util/languageRouting';
import useAnalytics from '../../hooks/useAnalytics';
import { setTemplateOrigin } from '../../util/analytics/templateOrigin';

// 공유 URL의 data 파라미터를 안전하게 디코딩하고 실패 시 null을 반환한다.
function getDecodedDataOrNull(
  encodedData: string | null,
): DebateTableData | null {
  let decodedData: DebateTableData | null = null;

  if (encodedData !== null) {
    try {
      decodedData = decodeDebateTableData(encodedData);
    } catch {
      return null;
    }
  }

  return decodedData;
}

/**
 * ### Component TableSharingPage
 * 공유된 테이블 데이터를 처리하는 페이지. 다음 절차에 따라 플로우가 진행됨:
 * 1. 쿼리 파라미터로 인코딩 데이터가 잘 들어왔는지 확인
 * - 잘 들어왔을 경우, 계속 진행
 * - null일 경우, 오류 반환
 * 2. 인코딩 데이터를 디코딩하여, 올바른 데이터를 담고 있는지 확인
 * - 올바른 데이터를 담고 있을 경우, 계속 진행
 * - 디코딩 과정에서 오류 발생 시, 오류 반환
 * 3. 로그인 상태인지 확인
 * - 로그인 상태일 경우, 모달을 열어 저장 여부를 물어봄
 * - 로그인 상태가 아닐 경우, 비회원 플로우 실행
 */
export default function TableSharingPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { trackEvent } = useAnalytics();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get('data');
  // encodedData가 변경될 때만 디코딩을 재실행해 effect 의존성을 안정화한다.
  const decodedData = useMemo(() => getDecodedDataOrNull(encodedData), [encodedData]);
  const source = searchParams.get('source');
  const isTemplateEntry = source === 'template';

  // 공유 링크 유입 추적: encodedData/isTemplateEntry에만 의존해 1회만 발화한다.
  useEffect(() => {
    if (encodedData && !isTemplateEntry) {
      trackEvent('share_link_entered', { referrer: document.referrer });
    }
  }, [encodedData, isTemplateEntry, trackEvent]);

  // 템플릿 유입 정보는 decodedData가 유효할 때만 저장한다.
  useEffect(() => {
    if (isTemplateEntry && decodedData) {
      const org = searchParams.get('org');
      const tmpl = searchParams.get('tmpl');
      if (org && tmpl) {
        setTemplateOrigin({
          organization_name: org,
          template_name: tmpl,
          template_label: `${org} - ${tmpl}`,
        });
      }
    }
  }, [decodedData, isTemplateEntry, searchParams]);

  // 로그인 상태와 URL 형태에 따라 저장 모달, 게스트 복사, 즉시 저장 플로우를 분기한다.
  useEffect(() => {
    if (isLoggedIn()) {
      if (isGuestFlow() && encodedData === null) {
        // URL == /BASE_URL/share일 때, 즉 data 쿼리 파라미터가 없을 때
        // OAuth 리다이렉트 후 세션 저장소에 있는 테이블 바로 저장
        sessionDebateTableRepository.getTable().then(
          (value: GetDebateTableResponseType) => {
            apiDebateTableRepository
              .addTable(value as PostDebateTableResponseType)
              .then(
                // 저장 성공 시
                (value: PostDebateTableResponseType) => {
                  closeModal();
                  sessionDebateTableRepository.deleteTable();
                  navigate(
                    buildLangPath(`/overview/customize/${value.id}`, lang),
                  );
                },
                // 저장 실패 시
                () => {
                  closeModal();
                  throw new Error(t('공유받은 테이블을 저장하지 못했어요.'));
                },
              );
          },
          () => {
            // 세션 저장소에서 테이블을 불러오지 못할 때
            closeModal();
            throw new Error(t('테이블 데이터를 확인할 수 없어요.'));
          },
        );
      } else {
        // URL == /BASE_URL/share?data=something일 때,
        // 즉 data 쿼리 파라미터가 없을 때
        // 로그인 사용자가 공유 URL로 접속할 때를 의미
        openModal();
      }
    } else {
      // On this case, getRepository() will automatically decide what data source to use
      if (!decodedData) {
        throw new Error(t('공유된 데이터가 비어 있어요.'));
      }

      sessionDebateTableRepository.deleteTable();
      sessionDebateTableRepository.addTable(decodedData).then(
        () => {
          // On success
          navigate(buildLangPath(`/overview/customize/guest`, lang));
        },
        () => {
          // Handling error
          throw new Error(t('공유된 토론 테이블을 DB에 저장하지 못했어요.'));
        },
      );
    }
  }, [decodedData, navigate, openModal, closeModal, encodedData, lang]);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8">
        <LoadingSpinner
          strokeWidth={3}
          size={'size-24'}
          color={'text-brand-main'}
        />

        <p className="text-2xl">{t('데이터를 처리하고 있습니다...')}</p>
      </div>

      <ModalWrapper>
        {/* 로그인 사용자는 저장 여부에 따라 계정 저장 또는 게스트 이어하기를 선택한다. */}
        {decodedData && (
          <LoggedInStoreDBModal
            onSave={() => {
              // 공유받은 테이블을 계정에 저장한 뒤 개요 화면으로 이동한다.
              apiDebateTableRepository.addTable(decodedData).then(
                (value) => {
                  closeModal();
                  sessionDebateTableRepository.deleteTable();
                  navigate(
                    buildLangPath(`/overview/customize/${value.id}`, lang),
                  );
                },
                () => {
                  closeModal();
                  throw new Error(t('공유받은 테이블을 저장하지 못했어요.'));
                },
              );
            }}
            onContinue={() => {
              // 공유받은 테이블을 세션에만 저장하고 게스트 플로우로 이어간다.
              sessionDebateTableRepository.addTable(decodedData).then(
                () => {
                  closeModal();
                  navigate(buildLangPath('/overview/customize/guest', lang));
                },
                () => {
                  closeModal();
                  throw new Error(t('공유받은 데이터 처리에 실패했어요.'));
                },
              );
            }}
          />
        )}
      </ModalWrapper>
    </>
  );
}
