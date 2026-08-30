import { app, BrowserWindow } from 'electron';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 3001;

// Packaged builds carry the server + built frontend under
// resources/server and resources/client/dist (see the `extraResources`
// config in package.json); dev runs against the sibling folders directly.
const serverEntry = app.isPackaged
  ? path.join(process.resourcesPath, 'server', 'src', 'server.js')
  : path.join(__dirname, '..', 'server', 'src', 'server.js');

// The install directory isn't reliably writable — keep the database in the
// per-user app-data folder instead. db.js reads this before it opens the DB.
process.env.DATA_DIR = path.join(app.getPath('userData'), 'data');
process.env.PORT = String(PORT);

async function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status < 500) return true;
    } catch {
      // not up yet
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  return false;
}

async function createWindow() {
  await import(pathToFileURL(serverEntry).href);
  await waitForServer(`http://localhost:${PORT}/api/login`);

  const win = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 960,
    minHeight: 640,
    autoHideMenuBar: true,
    backgroundColor: '#0A0E12',
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
    },
  });
  win.loadURL(`http://localhost:${PORT}/`);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
