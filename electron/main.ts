import { app, BrowserWindow, ipcMain } from 'electron';
import { UUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { DebateTableData } from './type';
import { getItem, getAllItems, deleteItem, patchItem, postItem } from './api';

// Vite 개발 서버 URL. process.env.VITE_DEV_SERVER_URL는 vite-plugin-electron이 자동으로 설정해줍니다.
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// Window setting
function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, './preload.js'), // preload 스크립트 경로
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  mainWindow.setMenu(null);

  if (VITE_DEV_SERVER_URL) {
    // 개발 모드: Vite 개발 서버 로드
    mainWindow.loadURL(VITE_DEV_SERVER_URL);
    // 개발자 도구 열기
    mainWindow.webContents.openDevTools();
  } else {
    // 프로덕션 모드: 빌드된 React 앱 로드
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

// Database related codes
const dbPath = path.join(app.getPath('userData'), 'db.json');

// Initialize database
async function initDb() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify([]));
  }
}

// IPC Handlers
// GET
ipcMain.handle(
  'db-get',
  async (_event, id: UUID): Promise<DebateTableData> => getItem(dbPath, id),
);

// GET ALL
ipcMain.handle('db-get-all', async () => getAllItems(dbPath));

// POST
ipcMain.handle('db-post', async (_event, item: DebateTableData) =>
  postItem(dbPath, item),
);

// DELETE
ipcMain.handle('db-delete', async (_event, id: UUID) => deleteItem(dbPath, id));

// PATCH
ipcMain.handle('db-patch', async (_event, item: DebateTableData) =>
  patchItem(dbPath, item),
);

// Launch app
app.whenReady().then(() => {
  initDb();
  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
