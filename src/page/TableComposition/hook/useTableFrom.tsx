import { useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { TableCompositionStep } from '../TableComposition';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import {
  DetailDebateInfo,
  ParliamentaryTimeBoxInfo,
  DebateType,
} from '../../../type/type';
import useAddTable from '../../../hooks/mutations/useAddTable';
import { usePutParliamentaryDebateTable } from '../../../hooks/mutations/usePutParliamentaryDebateTable';

export interface TableFormData {
  info: DetailDebateInfo & { type: DebateType };
  table: ParliamentaryTimeBoxInfo[];
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
          name: '',
          agenda: '',
          type: 'PARLIAMENTARY',
          warningBell: true,
          finishBell: true,
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
    React.SetStateAction<{
      name: string;
      agenda: string;
      type: DebateType;
      warningBell: boolean;
      finishBell: boolean;
    }>
  > = (action) => {
    setFormData((prev) => {
      let newInfo: {
        name: string;
        agenda: string;
        type: DebateType;
        warningBell: boolean;
        finishBell: boolean;
      };
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

  const updateTable: React.Dispatch<
    React.SetStateAction<ParliamentaryTimeBoxInfo[]>
  > = (action) => {
    setFormData((prev) => {
      let newTable: ParliamentaryTimeBoxInfo[];
      if (typeof action === 'function') {
        newTable = (
          action as (
            arg: ParliamentaryTimeBoxInfo[],
          ) => ParliamentaryTimeBoxInfo[]
        )(prev.table);
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
    (tableId: number) => {
      removeValue();
      navigate(`/overview/${tableId}`);
    },
  );
  const { mutate: EditTable, isPending: isEditTablePending } =
    usePutParliamentaryDebateTable((tableId: number) => {
      removeValue();
      navigate(`/overview/${tableId}`);
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
