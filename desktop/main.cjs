const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const http = require('node:http');

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
    const ready = await new Promise((resolve) => {
      const request = http.get(url, (response) => {
        response.resume();
        resolve(response.statusCode < 500);
      });
      request.on('error', () => resolve(false));
      request.setTimeout(1000, () => {
        request.destroy();
        resolve(false);
      });
    });
    if (ready) return true;
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  return false;
}

async function createWindow() {
  await import(pathToFileURL(serverEntry).href);
  await waitForServer(`http://127.0.0.1:${PORT}/api/login`);

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
  win.loadURL(`http://127.0.0.1:${PORT}/`);
}

app.whenReady().then(createWindow).catch((error) => {
  console.error('Desktop startup failed:', error);
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
