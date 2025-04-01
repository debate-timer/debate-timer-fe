import { useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { TableCompositionStep } from '../TableComposition';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import {
  ParliamentaryTimeBoxInfo,
  CustomizeTimeBoxInfo,
  ParliamentaryInfo,
  CustomizeInfo,
} from '../../../type/type';
import useAddParliamentaryTable from '../../../hooks/mutations/useAddParliamentaryDebateTable';
import { usePutParliamentaryDebateTable } from '../../../hooks/mutations/usePutParliamentaryDebateTable';
import useAddCustomizeTable from '../../../hooks/mutations/useAddCustomizeDebateTable';
import { usePutCustomizeDebateTable } from '../../../hooks/mutations/usePutCustomizeDebateTable';

// type 필드 포함한 인터페이스를 info로 사용. 의회식/사용자지정 구분
interface ParliamentaryTableFormData {
  info: ParliamentaryInfo;
  table: ParliamentaryTimeBoxInfo[];
}
interface CustomizeTableFormData {
  info: CustomizeInfo;
  table: CustomizeTimeBoxInfo[];
}
export type TableFormData = ParliamentaryTableFormData | CustomizeTableFormData;
export type TimeBoxInfo = ParliamentaryTimeBoxInfo | CustomizeTimeBoxInfo;

const useTableFrom = (
  currentStep: TableCompositionStep,
  initData?: TableFormData,
) => {
  const navigationType = useNavigationType();
  const navigate = useNavigate();

  const [formData, setFormData, removeValue] = useBrowserStorage<TableFormData>(
    {
      key: 'creationInfo',
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
    React.SetStateAction<TableFormData['info']>
  > = (action) => {
    setFormData((prev) => {
      const newInfo = typeof action === 'function' ? action(prev.info) : action;

      if (isCustomizeInfo(newInfo)) {
        const customizeInfo: CustomizeInfo = {
          name: newInfo.name,
          agenda: newInfo.agenda,
          type: 'CUSTOMIZE',
          warningBell: newInfo.warningBell,
          finishBell: newInfo.finishBell,
          prosTeamName: newInfo.prosTeamName,
          consTeamName: newInfo.consTeamName,
        };
        return {
          info: customizeInfo,
          table: prev.table as CustomizeTimeBoxInfo[],
        };
      } else {
        const parliamentaryInfo: ParliamentaryInfo = {
          name: newInfo.name,
          agenda: newInfo.agenda,
          type: 'PARLIAMENTARY',
          warningBell: newInfo.warningBell,
          finishBell: newInfo.finishBell,
        };
        return {
          info: parliamentaryInfo,
          table: prev.table as ParliamentaryTimeBoxInfo[],
        };
      }
    });
  };

  const updateTable = (
    action: TimeBoxInfo[] | ((prev: TimeBoxInfo[]) => TimeBoxInfo[]),
  ) => {
    setFormData((prev) => {
      const newTable =
        typeof action === 'function' ? action(prev.table) : action;

      if (isCustomizeInfo(prev.info)) {
        return {
          info: prev.info,
          table: newTable,
        } as CustomizeTableFormData;
      } else {
        return {
          info: prev.info,
          table: newTable,
        } as ParliamentaryTableFormData;
      }
    });
  };

  const { mutate: addParliamentary } = useAddParliamentaryTable((tableId) => {
    removeValue();
    navigate(`/overview/${tableId}`);
  });

  const { mutate: addCustomize } = useAddCustomizeTable((tableId) => {
    removeValue();
    navigate(`/overview/${tableId}`);
  });

  const { mutate: editParliamentary } = usePutParliamentaryDebateTable(
    (tableId) => {
      removeValue();
      navigate(`/overview/${tableId}`);
    },
  );

  const { mutate: editCustomize } = usePutCustomizeDebateTable((tableId) => {
    removeValue();
    navigate(`/overview/${tableId}`);
  });

  // customize 타입 가드
  function isCustomizeInfo(info: TableFormData['info']): info is CustomizeInfo {
    return info.type === 'CUSTOMIZE';
  }

  const AddTable = () => {
    if (isCustomizeInfo(formData.info)) {
      addCustomize({
        info: formData.info,
        table: formData.table as CustomizeTimeBoxInfo[],
      });
    } else {
      addParliamentary({
        info: formData.info,
        table: formData.table as ParliamentaryTimeBoxInfo[],
      });
    }
  };

  const EditTable = (tableId: number) => {
    if (isCustomizeInfo(formData.info)) {
      editCustomize({
        tableId,
        info: formData.info,
        table: formData.table as CustomizeTimeBoxInfo[],
      });
    } else {
      editParliamentary({
        tableId,
        info: formData.info,
        table: formData.table as ParliamentaryTimeBoxInfo[],
      });
    }
  };

  return {
    formData,
    updateInfo,
    updateTable,
    AddTable,
    EditTable,
    // 미사용한 pending 삭제
  };
};

export default useTableFrom;
