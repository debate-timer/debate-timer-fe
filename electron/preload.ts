import { contextBridge, ipcRenderer } from 'electron';
import { DebateTableData } from './type';
import { UUID } from 'crypto';

interface DB_API {
  get: (id: UUID) => Promise<DebateTableData>;
  getAll: () => Promise<DebateTableData[]>;
  post: (item: DebateTableData) => Promise<DebateTableData>;
  delete: (id: UUID) => Promise<DebateTableData[]>;
  patch: (item: DebateTableData) => Promise<DebateTableData>;
}

declare global {
  interface Window {
    db: DB_API;
  }
}

contextBridge.exposeInMainWorld('db', {
  get: (id: UUID) => ipcRenderer.invoke('db-get', id),
  getAll: () => ipcRenderer.invoke('db-get-all'),
  post: (item: DebateTableData) => ipcRenderer.invoke('db-post', item),
  delete: (id: UUID) => ipcRenderer.invoke('db-delete', id),
  patch: (item: DebateTableData) => ipcRenderer.invoke('db-patch', item),
});
