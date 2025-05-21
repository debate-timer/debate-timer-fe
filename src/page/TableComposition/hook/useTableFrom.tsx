import { useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { TableCompositionStep } from '../TableComposition';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { DebateInfo, TableFormData, TimeBoxInfo } from '../../../type/type';
import useAddCustomizeTable from '../../../hooks/mutations/useAddCustomizeDebateTable';
import { usePutCustomizeDebateTable } from '../../../hooks/mutations/usePutCustomizeDebateTable';

const useTableFrom = (
  currentStep: TableCompositionStep,
  initData?: TableFormData,
) => {
  const navigationType = useNavigationType();
  const navigate = useNavigate();

  // Set default value as CUSTOMIZE to prevent users to make PARLIAMENTARY tables
  const [formData, setFormData, removeValue] = useBrowserStorage<TableFormData>(
    {
      key: 'creationInfo',
      initialState: {
        info: {
          name: '',
          agenda: '',
          prosTeamName: '',
          consTeamName: '',
          warningBell: true,
          finishBell: true,
        },
        table: [],
      },
      storage: 'sessionStorage',
    },
  );

  const isNewCreation =
    currentStep === 'NameAndType' && navigationType === 'PUSH';

  if (isNewCreation) {
    removeValue();
  }

  useEffect(() => {
    if (initData) {
      setFormData(initData);
    }
    // Originaly here was exhaustive-deps
  }, [initData, setFormData]);

  useEffect(() => {
    if (currentStep === 'TimeBox' && navigationType === 'POP') {
      navigate('/');
    }
  }, [currentStep, navigationType, navigate]);

  const updateInfo: React.Dispatch<
    React.SetStateAction<TableFormData['info']>
  > = (action) => {
    setFormData((prev) => {
      const newInfo = typeof action === 'function' ? action(prev.info) : action;
      const debateInfo: DebateInfo = {
        name: newInfo.name,
        agenda: newInfo.agenda,
        warningBell: newInfo.warningBell,
        finishBell: newInfo.finishBell,
        prosTeamName: newInfo.prosTeamName,
        consTeamName: newInfo.consTeamName,
      };

      return {
        info: debateInfo,
        table: prev.table as TimeBoxInfo[],
      };
    });
  };

  const updateTable = (
    action: TimeBoxInfo[] | ((prev: TimeBoxInfo[]) => TimeBoxInfo[]),
  ) => {
    setFormData((prev) => {
      const newTable =
        typeof action === 'function' ? action(prev.table) : action;
      return {
        info: prev.info,
        table: newTable,
      } as TableFormData;
    });
  };

  const { mutate: onAddTable } = useAddCustomizeTable((tableId) => {
    removeValue();
    navigate(`/overview/customize/${tableId}`);
  });

  const { mutate: onModifyTable } = usePutCustomizeDebateTable((tableId) => {
    removeValue();
    navigate(`/overview/customize/${tableId}`);
  });

  const AddTable = () => {
    onAddTable({
      info: formData.info,
      table: formData.table as TimeBoxInfo[],
    });
  };

  const EditTable = (tableId: number) => {
    onModifyTable({
      tableId,
      info: formData.info,
      table: formData.table as TimeBoxInfo[],
    });
  };

  return {
    formData,
    updateInfo,
    updateTable,
    AddTable,
    EditTable,
  };
};

export default useTableFrom;
