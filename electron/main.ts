import { app, BrowserWindow, ipcMain } from 'electron';
import { randomUUID, UUID } from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { DebateTableData } from './type';

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

// Read database (helper function used on API requests)
async function readDb() {
  const data = await fs.readFile(dbPath, 'utf-8');
  const parsedData = JSON.parse(data);
  return Array.isArray(parsedData) ? parsedData : [];
}

// GET
ipcMain.handle('db-get', async (_event, id: UUID): Promise<DebateTableData> => {
  const db = await readDb();
  const target = db.find((record: DebateTableData) => record.info.id === id);
  if (target) {
    return target;
  } else {
    throw new Error('Failed to find item.');
  }
});

// GET ALL
ipcMain.handle('db-get-all', async () => readDb());

// POST
ipcMain.handle('db-post', async (_event, item: DebateTableData) => {
  const db = await readDb();
  item.info.id = randomUUID();
  db.push(item);
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
  return item;
});

// DELETE
ipcMain.handle('db-delete', async (_event, id: UUID) => {
  const db = await readDb();
  const updatedDb = db.filter(
    (record: DebateTableData) => record.info.id !== id,
  );
  await fs.writeFile(dbPath, JSON.stringify(updatedDb, null, 2));
  return updatedDb;
});

// PATCH
ipcMain.handle('db-patch', async (_event, item: DebateTableData) => {
  const db = await readDb();
  const updatedDb = db.map((record: DebateTableData) =>
    record.info.id === item.info.id ? item : record,
  );
  await fs.writeFile(dbPath, JSON.stringify(updatedDb, null, 2));
  return item;
});

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
