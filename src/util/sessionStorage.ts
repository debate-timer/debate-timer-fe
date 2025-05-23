import {
  GetDebateTableResponseType,
  PostDebateTableResponseType,
} from '../apis/responses/customize';
import { DebateTableData } from '../type/type';

const STORAGE_KEY_PREFIX = 'DebateTableData';

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

export function isGuestFlow(): boolean {
  return !!sessionStorage.getItem(STORAGE_KEY_PREFIX);
}
