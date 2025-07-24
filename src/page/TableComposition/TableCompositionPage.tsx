import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TableNameAndType from './components/TableNameAndType/TableNameAndType';
import useFunnel from '../../hooks/useFunnel';
import useTableFrom from './hook/useTableFrom';
import TimeBoxStep from './components/TimeBoxStep/TimeBoxStep';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { DebateInfo, TimeBoxInfo } from '../../type/type';
import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import ErrorIndicator from '../../components/ErrorIndicator/ErrorIndicator';

export type TableCompositionStep = 'NameAndType' | 'TimeBox';
type Mode = 'edit' | 'add';

export default function TableCompositionPage() {
  // URL 등으로부터 "editMode"와 "tableId"를 추출
  const [searchParams] = useSearchParams();
  const rawMode = searchParams.get('mode');
  const rawTableId = searchParams.get('tableId');

  // Verify mode param
  if (rawMode !== 'edit' && rawMode !== 'add') {
    throw new Error('테이블 모드가 올바르지 않습니다.');
  }
  const mode = rawMode as Mode;

  // Verify table id param
  if (mode === 'edit' && (rawTableId === null || isNaN(Number(rawTableId)))) {
    throw new Error('테이블 ID가 올바르지 않습니다.');
  }
  const tableId = rawTableId ? Number(rawTableId) : 0;

  // Print different funnel page by mode (edit a existing table or add a new table)
  const initialMode: TableCompositionStep =
    mode !== 'edit' ? 'NameAndType' : 'TimeBox';
  const { Funnel, currentStep, goToStep } =
    useFunnel<TableCompositionStep>(initialMode);

  // edit 모드일 때만 서버에서 initData를 가져옴
  const {
    data,
    isError: isFetchError,
    isRefetchError,
    isLoading: isFetching,
    isRefetching,
    refetch,
  } = useGetDebateTableData(tableId, mode === 'edit');

  // 테이블 데이터 패칭 분기
  const initData = useMemo(() => {
    if (mode === 'edit' && data) {
      const info = data.info as DebateInfo;

      return {
        info: info,
        table: data.table as TimeBoxInfo[],
      };
    }
    return undefined;
  }, [mode, data]);

  // Declare constants to handle async request
  const isError = mode === 'add' ? false : isFetchError || isRefetchError;
  const isLoading = mode === 'add' ? false : isFetching || isRefetching;

  const {
    formData,
    updateInfo,
    updateTable,
    addTable,
    editTable,
    isAddingTable,
    isModifyingTable,
  } = useTableFrom(currentStep, initData);

  const handleButtonClick = () => {
    const patchedInfo = {
      ...formData.info,
      name: formData.info.name ?? '시간표 1',
      prosTeamName: formData.info.prosTeamName ?? '찬성',
      consTeamName: formData.info.consTeamName ?? '반대',
    };
    updateInfo(patchedInfo);

    if (mode === 'edit') {
      editTable(tableId);
    } else {
      addTable();
    }
  };

  // If error, print error message and let user be able to retry
  if (isError) {
    return (
      <DefaultLayout>
        <DefaultLayout.ContentContainer>
          <ErrorIndicator onClickRetry={() => refetch()}>
            시간표 정보를 불러오지 못했어요...<br></br>다시 시도할까요?
          </ErrorIndicator>
        </DefaultLayout.ContentContainer>
      </DefaultLayout>
    );
  }

  // If no error or on loading, print contents
  // Only pass isLoading because isError is used right above this code line
  return (
    <DefaultLayout>
      <Funnel
        step={{
          NameAndType: (
            <TableNameAndType
              info={formData.info}
              isLoading={isLoading}
              isEdit={mode === 'edit'}
              onInfoChange={updateInfo}
              onButtonClick={() => goToStep('TimeBox')}
            />
          ),
          TimeBox: (
            <TimeBoxStep
              initData={formData}
              isLoading={isLoading}
              isEdit={mode === 'edit'}
              onTimeBoxChange={updateTable}
              onFinishButtonClick={handleButtonClick}
              onEditTableInfoButtonClick={() => goToStep('NameAndType')}
              isSubmitting={mode === 'edit' ? isModifyingTable : isAddingTable}
            />
          ),
        }}
      />
    </DefaultLayout>
  );
}
