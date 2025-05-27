import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TableNameAndType from './components/TableNameAndType/TableNameAndType';
import useFunnel from '../../hooks/useFunnel';
import useTableFrom from './hook/useTableFrom';
import TimeBoxStep from './components/TimeBoxStep/TimeBoxStep';
import { useGetDebateTableData } from '../../hooks/query/useGetDebateTableData';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { DebateInfo, TimeBoxInfo } from '../../type/type';

export type TableCompositionStep = 'NameAndType' | 'TimeBox';
type Mode = 'edit' | 'add';

export default function TableComposition() {
  // URL 등으로부터 "editMode"와 "tableId"를 추출
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as Mode;
  const tableId = Number(searchParams.get('tableId') || 0);

  // Print different funnel page by mode (edit a existing table or add a new table)
  const initialMode: TableCompositionStep =
    mode !== 'edit' ? 'NameAndType' : 'TimeBox';
  const { Funnel, currentStep, goToStep } =
    useFunnel<TableCompositionStep>(initialMode);

  // edit 모드일 때만 서버에서 initData를 가져옴
  // 테이블 데이터 패칭 분기
  const { data } = useGetDebateTableData(tableId, mode === 'edit');

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

  const { formData, updateInfo, updateTable, AddTable, EditTable } =
    useTableFrom(currentStep, initData);

  const handleButtonClick = () => {
    const patchedInfo = {
      ...formData.info,
      name: formData.info.name ?? '시간표 1',
      prosTeamName: formData.info.prosTeamName ?? '찬성',
      consTeamName: formData.info.consTeamName ?? '반대',
    };
    updateInfo(patchedInfo);

    if (mode === 'edit') {
      EditTable(tableId);
    } else {
      AddTable();
    }
  };

  return (
    <DefaultLayout>
      <Funnel
        step={{
          NameAndType: (
            <TableNameAndType
              info={formData.info}
              isEdit={mode === 'edit'}
              onInfoChange={updateInfo}
              onButtonClick={() => goToStep('TimeBox')}
            />
          ),
          TimeBox: (
            <TimeBoxStep
              initData={formData}
              isEdit={mode === 'edit'}
              onTimeBoxChange={updateTable}
              onFinishButtonClick={handleButtonClick}
              onEditTableInfoButtonClick={() => goToStep('NameAndType')}
            />
          ),
        }}
      />
    </DefaultLayout>
  );
}
