import { useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { TableCompositionStep } from '../TableComposition';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { DebateInfo, Type } from '../../../type/type';
import useAddTable from '../../../hooks/mutations/useAddTable';
import { usePutParliamentaryDebateTable } from '../../../hooks/mutations/usePutParliamentaryDebateTable';

export interface TableFormData {
  info: {
    name: string;
    agenda: string;
    type: Type; // 새로 추가된 속성
  };
  table: DebateInfo[];
}
const useTableFrom = (
  currentStep: TableCompositionStep,
  initData?: TableFormData,
) => {
  const navigationType = useNavigationType();
  const navigate = useNavigate();

  const [formData, setFormData, removeValue] = useBrowserStorage<TableFormData>(
    {
      key: 'moimCreationInfo',
      initialState: {
        info: {
          name: '테이블 1',
          agenda: '',
          type: 'PARLIAMENTARY',
        },
        table: [],
      },
      storage: 'sessionStorage',
    },
  );
  const isNewMoimCreation =
    currentStep === 'NameAndType' && navigationType === 'PUSH';

  if (isNewMoimCreation) {
    removeValue();
  }

  useEffect(() => {
    if (initData) {
      setFormData(initData);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initData]);

  useEffect(() => {
    if (currentStep === 'TimeBox' && navigationType === 'POP') {
      navigate('/');
    }
  }, [currentStep, navigationType, navigate]);

  const updateInfo: React.Dispatch<
    React.SetStateAction<{ name: string; agenda: string; type: Type }>
  > = (action) => {
    setFormData((prev) => {
      let newInfo: { name: string; agenda: string; type: Type };
      if (typeof action === 'function') {
        newInfo = (action as (arg: typeof prev.info) => typeof prev.info)(
          prev.info,
        );
      } else {
        newInfo = action;
      }
      return { ...prev, info: newInfo };
    });
  };

  const updateTable: React.Dispatch<React.SetStateAction<DebateInfo[]>> = (
    action,
  ) => {
    setFormData((prev) => {
      let newTable: DebateInfo[];
      if (typeof action === 'function') {
        newTable = (action as (arg: DebateInfo[]) => DebateInfo[])(prev.table);
      } else {
        newTable = action;
      }
      return {
        ...prev,
        table: newTable,
      };
    });
  };

  const { mutate: AddTable, isPending: isAddTablePending } = useAddTable(
    (id: number) => {
      removeValue();
      navigate(`/overview/${id}`);
    },
  );
  const { mutate: EditTable, isPending: isEditTablePending } =
    usePutParliamentaryDebateTable((id: number) => {
      removeValue();
      navigate(`/overview/${id}`);
    });

  return {
    formData,
    updateInfo,
    updateTable,
    AddTable,
    EditTable,
    isAddTablePending,
    isEditTablePending,
  };
};

export default useTableFrom;
