const { app, BrowserWindow, ipcMain, dialog, shell, Menu } = require('electron');
const fs = require('fs');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 400,
    minHeight: 500,
    title: 'Kost Anugrah Jaya',
    icon: path.join(__dirname, 'build', 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });
  Menu.setApplicationMenu(null);
  win.loadFile(path.join(__dirname, 'app', 'index.html'));

  // Link eksternal (mis. wa.me) dibuka di browser bawaan, bukan di jendela aplikasi
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/i.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  win.webContents.on('will-navigate', (e, url) => {
    if (/^https?:/i.test(url)) { e.preventDefault(); shell.openExternal(url); }
  });
}

// Pengganti AndroidBridge.saveFile(filename, base64): tampilkan dialog "Simpan sebagai"
ipcMain.on('save-file', (event, filename, b64) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    const safeName = path.basename(String(filename || 'file'));
    const target = dialog.showSaveDialogSync(win, {
      defaultPath: path.join(app.getPath('downloads'), safeName)
    });
    if (!target) { event.returnValue = 'Dibatalkan'; return; }
    fs.writeFileSync(target, Buffer.from(String(b64), 'base64'));
    event.returnValue = 'ok';
  } catch (err) {
    event.returnValue = 'Gagal menyimpan: ' + err.message;
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
