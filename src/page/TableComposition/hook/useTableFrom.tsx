import { useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { PutDebateTableResponseType } from '../../../apis/responseTypes';
import { TableCompositionStep } from '../TableComposition';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { Agenda, DebateInfo } from '../../../type/type';
import useAddTable from '../../../hooks/mutations/useAddTable';
import { usePutParliamentaryDebateTable } from '../../../hooks/mutations/usePutParliamentaryDebateTable';

type TableFromData = Omit<PutDebateTableResponseType, 'id'>;
const useTableFrom = (
  currentStep: TableCompositionStep,
  initData?: TableFromData,
) => {
  const navigationType = useNavigationType();
  const navigate = useNavigate();

  const [formData, setFormData, removeValue] = useBrowserStorage<TableFromData>(
    {
      key: 'moimCreationInfo',
      initialState: {
        info: {
          name: '테이블 1',
          agenda: '의회식 토론',
        },
        table: [],
      },
      storage: 'sessionStorage',
    },
  );
  const isNewMoimCreation =
    currentStep === '이름타입입력' && navigationType === 'PUSH';

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
    if (currentStep === '타임박스입력' && navigationType === 'POP') {
      navigate('/table');
    }
  }, [currentStep, navigationType, navigate]);

  const updateInfo: React.Dispatch<
    React.SetStateAction<{ name: string; agenda: Agenda }>
  > = (action) => {
    setFormData((prev) => {
      let newInfo: { name: string; agenda: Agenda };
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
