import { useEffect } from 'react';
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
 * Handles the flow for processing and importing shared debate table data from a URL.
 *
 * Determines user flow based on login status and the presence of shared data in the URL. Decodes and validates shared data, manages saving to the appropriate repository, and navigates the user to the correct customization page. Presents a modal for logged-in users to choose between saving the shared table or continuing as a guest.
 *
 * @remark Throws an error if shared data is missing, invalid, or if saving fails at any step.
 */
export default function TableSharingPage() {
  const navigate = useNavigate();
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get('data');
  const decodedData = getDecodedDataOrNull(encodedData);

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
                  navigate(`/overview/customize/${value.id}`);
                },
                // 저장 실패 시
                () => {
                  closeModal();
                  throw new Error('공유받은 테이블을 저장하지 못했어요.');
                },
              );
          },
          () => {
            // 세션 저장소에서 테이블을 불러오지 못할 때
            closeModal();
            throw new Error('테이블 데이터를 확인할 수 없어요.');
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
        throw new Error('공유된 데이터가 비어 있어요.');
      }

      sessionDebateTableRepository.deleteTable();
      sessionDebateTableRepository.addTable(decodedData).then(
        () => {
          // On success
          navigate(`/overview/customize/guest`);
        },
        () => {
          // Handling error
          throw new Error('공유된 토론 테이블을 DB에 저장하지 못했어요.');
        },
      );
    }
  }, [decodedData, navigate, openModal, closeModal, encodedData]);

  return (
    <>
      <div className="flex min-h-screen w-full flex-col items-center justify-center space-y-8">
        <LoadingSpinner
          strokeWidth={3}
          size={'size-24'}
          color={'text-brand-main'}
        />
        <p className="text-2xl">데이터를 처리하고 있습니다...</p>
      </div>

      <ModalWrapper>
        {/* On this case, we have to specify the data source */}
        {decodedData && (
          <LoggedInStoreDBModal
            onSave={() => {
              apiDebateTableRepository.addTable(decodedData).then(
                (value) => {
                  closeModal();
                  sessionDebateTableRepository.deleteTable();
                  navigate(`/overview/customize/${value.id}`);
                },
                () => {
                  closeModal();
                  throw new Error('공유받은 테이블을 저장하지 못했어요.');
                },
              );
            }}
            onContinue={() => {
              sessionDebateTableRepository.addTable(decodedData).then(
                () => {
                  closeModal();
                  navigate('/overview/customize/guest');
                },
                () => {
                  closeModal();
                  throw new Error('공유받은 데이터 처리에 실패했어요.');
                },
              );
            }}
          />
        )}
      </ModalWrapper>
    </>
  );
}
