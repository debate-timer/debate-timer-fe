import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TableNameAndType from './components/TableNameAndType/TableNameAndType';
import useFunnel from '../../hooks/useFunnel';
import useTableFrom from './hook/useTableFrom';
import TimeBoxStep from './components/TimeBoxStep/TimeBoxStep';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useGetCustomizeTableData } from '../../hooks/query/useGetCustomizeTableData';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import {
  CustomizeDebateInfo,
  CustomizeTimeBoxInfo,
  DebateType,
  ParliamentaryDebateInfo,
  ParliamentaryTimeBoxInfo,
} from '../../type/type';

export type TableCompositionStep = 'NameAndType' | 'TimeBox';
type Mode = 'edit' | 'add';

export default function TableComposition() {
  const { Funnel, currentStep, goNextStep } =
    useFunnel<TableCompositionStep>('NameAndType');

  // 1) URL 등으로부터 "editMode"와 "tableId"를 추출
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as Mode;
  const type = (searchParams.get('type') as DebateType) ?? '';
  const tableId = Number(searchParams.get('tableId') || 0);

  // (2) edit 모드일 때만 서버에서 initData를 가져옴
  // 테이블 데이터 패칭 분기
  const { data: parliamentaryData } = useGetParliamentaryTableData(
    tableId,
    mode === 'edit' && type === 'PARLIAMENTARY',
  );
  const { data: customizeData } = useGetCustomizeTableData(
    tableId,
    mode === 'edit' && type === 'CUSTOMIZE',
  );
  const fetchedTableData =
    type === 'CUSTOMIZE' ? customizeData : parliamentaryData;

  const initData = useMemo(() => {
    if (mode === 'edit' && fetchedTableData) {
      if (type === 'CUSTOMIZE') {
        const info = fetchedTableData.info as CustomizeDebateInfo;
        return {
          info: {
            ...info,
            type: 'CUSTOMIZE' as const,
          },
          table: fetchedTableData.table as CustomizeTimeBoxInfo[],
        };
      } else {
        const info = fetchedTableData.info as ParliamentaryDebateInfo;
        return {
          info: {
            ...info,
            type: 'PARLIAMENTARY' as const,
          },
          table: fetchedTableData.table as ParliamentaryTimeBoxInfo[],
        };
      }
    }
    return undefined;
  }, [mode, fetchedTableData, type]);

  const { formData, updateInfo, updateTable, AddTable, EditTable } =
    useTableFrom(currentStep, initData);

  const handleButtonClick = () => {
    if (formData.info.type === 'CUSTOMIZE') {
      const patchedInfo = {
        ...formData.info,
        name: formData.info.name ?? '시간표 1',
        prosTeamName: formData.info.prosTeamName ?? '찬성',
        consTeamName: formData.info.consTeamName ?? '반대',
      };
      updateInfo(patchedInfo);
    } else {
      const patchedInfo = {
        ...formData.info,
        name: formData.info.name ?? '시간표 1',
      };
      updateInfo(patchedInfo);
    }

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
              onButtonClick={() => goNextStep('TimeBox')}
            />
          ),
          TimeBox: (
            <TimeBoxStep
              initData={formData}
              isEdit={mode === 'edit'}
              onTimeBoxChange={updateTable}
              onButtonClick={handleButtonClick}
            />
          ),
        }}
      />
    </DefaultLayout>
  );
}
