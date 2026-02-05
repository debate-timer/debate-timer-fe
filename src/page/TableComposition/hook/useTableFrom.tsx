import { useEffect } from 'react';
import { useNavigate, useNavigationType } from 'react-router-dom';
import { TableCompositionStep } from '../TableCompositionPage';
import useBrowserStorage from '../../../hooks/useBrowserStorage';
import { DebateInfo, DebateTableData, TimeBoxInfo } from '../../../type/type';
import useAddDebateTable from '../../../hooks/mutations/useAddDebateTable';
import { usePutDebateTable } from '../../../hooks/mutations/usePutDebateTable';
import { isGuestFlow } from '../../../util/sessionStorage';
import { useTranslation } from 'react-i18next';
import {
  buildLangPath,
  DEFAULT_LANG,
  isSupportedLang,
} from '../../../util/languageRouting';

const useTableFrom = (
  currentStep: TableCompositionStep,
  initData?: DebateTableData,
) => {
  const navigationType = useNavigationType();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const currentLang = i18n.resolvedLanguage ?? i18n.language;
  const lang = isSupportedLang(currentLang) ? currentLang : DEFAULT_LANG;

  // Set default value as CUSTOMIZE to prevent users to make PARLIAMENTARY tables
  const [formData, setFormData, removeValue] =
    useBrowserStorage<DebateTableData>({
      key: 'creationInfo',
      initialState: {
        info: {
          name: '',
          agenda: '',
          prosTeamName: '',
          consTeamName: '',
        },
        table: [],
      },
      storage: 'sessionStorage',
    });

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

  const updateInfo: React.Dispatch<
    React.SetStateAction<DebateTableData['info']>
  > = (action) => {
    setFormData((prev) => {
      const newInfo = typeof action === 'function' ? action(prev.info) : action;
      const debateInfo: DebateInfo = {
        name: newInfo.name,
        agenda: newInfo.agenda,
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
      } as DebateTableData;
    });
  };

  const { mutate: onAddTable, isPending: isAddingTable } = useAddDebateTable(
    (tableId) => {
      removeValue();
      navigate(buildLangPath(`/overview/customize/${tableId}`, lang));
    },
  );

  const { mutate: onModifyTable, isPending: isModifyingTable } =
    usePutDebateTable((tableId) => {
      removeValue();
      if (isGuestFlow()) {
        navigate(buildLangPath(`/overview/customize/guest`, lang));
      } else {
        navigate(buildLangPath(`/overview/customize/${tableId}`, lang));
      }
    });

  const addTable = () => {
    onAddTable({
      info: formData.info,
      table: formData.table as TimeBoxInfo[],
    });
  };

  const editTable = (tableId: number) => {
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
    addTable,
    editTable,
    isAddingTable,
    isModifyingTable,
  };
};

export default useTableFrom;
