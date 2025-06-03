import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
} from '../apis/responses/debateTable';
import { DebateTableData } from '../type/type';

const STORAGE_KEY_PREFIX = 'DebateTableData';
const IS_GUEST_FLOW_PREFIX = 'IsGuestFlow';
const TRUE = 'true';
const FALSE = 'false';

// For local debate table data
export const getSessionCustomizeTableData = () => {
  const data = sessionStorage.getItem(STORAGE_KEY_PREFIX);
  if (!data) throw new Error('No table data in sessionStorage');
  return JSON.parse(data) as GetDebateTableResponseType;
};

export const setSessionCustomizeTableData = (
  data: DebateTableData | PostDebateTableResponseType,
) => {
  sessionStorage.setItem(
    STORAGE_KEY_PREFIX,
    JSON.stringify({ id: -1, ...data }),
  );
  return { id: -1, ...data };
};

export const deleteSessionCustomizeTableData = () => {
  sessionStorage.removeItem(STORAGE_KEY_PREFIX);
};

// For isGuestFlow
export const isGuestFlow = () => {
  const value = sessionStorage.getItem(IS_GUEST_FLOW_PREFIX);
  if (!value) throw new Error('No table data in sessionStorage');
  return value === TRUE;
};

export const setIsGuestFlow = (newValue: boolean) => {
  sessionStorage.setItem(IS_GUEST_FLOW_PREFIX, newValue ? TRUE : FALSE);
};
