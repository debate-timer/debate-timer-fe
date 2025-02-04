import DefaultLayout from '../../layout/defaultLayout/DefaultLayout';
import TableNameAndType from './components/TableNameAndType/TableNameAndType';
import useFunnel from '../../hooks/useFunnel';
import useTableFrom from './hook/useTableFrom';
import TimeBoxStep from './components/TimeBoxStep/TimeBoxStep';
import { useGetParliamentaryTableData } from '../../hooks/query/useGetParliamentaryTableData';
import { useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';
import { Type } from '../../type/type';

export type TableCompositionStep = 'NameAndType' | 'TimeBox';
type Mode = 'edit' | 'add';

export default function TableComposition() {
  const { Funnel, currentStep, goNextStep } =
    useFunnel<TableCompositionStep>('NameAndType');

  // 1) URL 등으로부터 "editMode"와 "tableId"를 추출
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode') as Mode;
  const type = (searchParams.get('type') as Type) ?? '';
  const tableId = Number(searchParams.get('tableId') || 0);

  // (2) edit 모드일 때만 서버에서 initData를 가져옴
  const { data: fetchedTableData } = useGetParliamentaryTableData(
    tableId,
    mode === 'edit',
  );
  const initData = useMemo(() => {
    if (mode === 'edit' && fetchedTableData) {
      return {
        info: {
          name: fetchedTableData.info.name,
          agenda: fetchedTableData.info.agenda,
          type: type,
        },
        table: fetchedTableData.table,
      };
    }
    return undefined;
  }, [mode, fetchedTableData, type]);

  const { formData, updateInfo, updateTable, AddTable, EditTable } =
    useTableFrom(currentStep, initData);

  const handleButtonClick = () => {
    if (mode === 'edit') {
      EditTable({
        tableId: tableId, // etc
        tableName: formData.info.name ?? '테이블 1',
        tableAgenda: formData.info.agenda,
        table: formData.table,
      });
    } else {
      AddTable({
        tableName: formData.info.name ?? '테이블 1',
        tableAgenda: formData.info.agenda,
        table: formData.table,
      });
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
              onNameAndTypeChange={updateInfo}
              onButtonClick={() => goNextStep('TimeBox')}
            />
          ),
          TimeBox: (
            <TimeBoxStep
              initData={formData}
              isEdit={mode === 'edit'}
              onAgendaChange={updateInfo}
              onTimeBoxChange={updateTable}
              onButtonClick={handleButtonClick}
            />
          ),
        }}
      />
    </DefaultLayout>
  );
}
