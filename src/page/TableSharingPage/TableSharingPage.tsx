import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useModal } from '../../hooks/useModal';
import LoggedInStoreDBModal from './components/LoggedInStoreDBModal';
import { decodeDebateTableData } from '../../util/arrayEncoding';
import LoadingSpinner from '../../components/LoadingSpinner';
import { DebateTableData } from '../../type/type';
import { getRepository } from '../../repositories/DebateTableRepository';
import apiDebateTableRepository from '../../repositories/ApiDebateTableRepository';
import sessionDebateTableRepository from '../../repositories/SessionDebateTableRepository';
import { isLoggedIn } from '../../util/accessToken';
import { PostDebateTableResponseType } from '../../apis/responses/debateTable';

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
  const { openModal, closeModal, ModalWrapper } = useModal();
  const [searchParams] = useSearchParams();
  const encodedData = searchParams.get('data');
  console.log('# DATA = ' + encodedData);
  const decodedData = getDecodedDataOrThrow(encodedData);

  useEffect(() => {
    if (isLoggedIn()) {
      openModal();
    } else {
      // On this case, getRepository() will automatically decide what data source to use
      getRepository()
        .addTable(decodedData)
        .then(
          (value: PostDebateTableResponseType) => {
            // And if POST request is succesful, directly navigate to overview page
            navigate(`/overview/customize/${value.id}`);
          },
          () => {
            // Handling error
            throw new Error('공유된 토론 테이블을 DB에 저장하지 못했어요.');
          },
        );
    }
  }, [decodedData, navigate, openModal]);

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
            apiDebateTableRepository.addTable(decodedData).then(
              // On fulfilled
              () => {
                closeModal();
                navigate('/');
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
