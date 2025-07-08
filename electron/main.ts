import { app, BrowserWindow } from 'electron';
import path from 'path';

// Vite 개발 서버 URL. process.env.VITE_DEV_SERVER_URL는 vite-plugin-electron이 자동으로 설정해줍니다.
const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

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

app.whenReady().then(createWindow);

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
