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

function getDecodedDataOrThrow(encodedData: string | null): DebateTableData {
  if (!encodedData) {
    throw new Error('공유받은 데이터가 비어 있어요.');
  }
  const decodedData = decodeDebateTableData(encodedData);
  if (!decodedData) {
    throw new Error('공유받은 데이터에 문제가 있어요.');
  }

  return decodedData;
}
/*
function getDecodedDataOrNull(
  encodedData: string | null,
): DebateTableData | null {
  if (!encodedData) {
    return null;
  }
  const decodedData = decodeDebateTableData(encodedData);
  if (!decodedData) {
    return null;
  }

  return decodedData;
}
*/

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
  const navigate = useNavigate();
  const { openModal, closeModal, ModalWrapper } = useModal({
    isCloseButtonExist: false,
  });
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get('data');
  console.log('# DATA = ' + encodedData);
  const decodedData = getDecodedDataOrThrow(encodedData);

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
  }, [decodedData, navigate, openModal, closeModal]);

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
        <LoggedInStoreDBModal
          onSave={() => {
            decodedData.info.name = '(공유됨) ' + decodedData.info.name;
            apiDebateTableRepository.addTable(decodedData).then(
              // On fulfilled
              (value: PostDebateTableResponseType) => {
                closeModal();
                sessionDebateTableRepository.deleteTable();
                navigate(`/overview/customize/${value.id}`);
              },
              // On failed
              () => {
                closeModal();
                throw new Error('공유받은 테이블을 저장하지 못했어요.');
              },
            );
          }}
          onContinue={() => {
            sessionDebateTableRepository.addTable(decodedData).then(
              // On fulfilled
              () => {
                closeModal();
                navigate('/overview/customize/guest');
              },
              // On failed
              () => {
                closeModal();
                throw new Error('공유받은 데이터 처리에 실패했어요.');
              },
            );
          }}
        />
      </ModalWrapper>
    </>
  );
}
