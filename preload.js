const { contextBridge, ipcRenderer } = require('electron');

// index.html asli (versi Android) memakai AndroidBridge.saveFile untuk ekspor/unduh file.
// Di sini kita sediakan objek yang sama, jadi index.html tidak perlu diubah.
contextBridge.exposeInMainWorld('AndroidBridge', {
  saveFile: (filename, b64) => ipcRenderer.sendSync('save-file', filename, b64)
});
