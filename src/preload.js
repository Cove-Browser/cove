const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  storeGet: (key) => ipcRenderer.invoke('store-get', key),
  storeSet: (key, value) => ipcRenderer.invoke('store-set', key, value),
  storeDelete: (key) => ipcRenderer.invoke('store-delete', key),
  minimize: () => ipcRenderer.invoke('window-minimize'),
  maximize: () => ipcRenderer.invoke('window-maximize'),
  closeWindow: () => ipcRenderer.invoke('window-close'),
  getNativeTheme: () => ipcRenderer.invoke('get-native-theme'),
  setTitlebarOverlay: (opts) => ipcRenderer.invoke('set-titlebar-overlay', opts),
  clearSession: () => ipcRenderer.invoke('clear-session'),
  openIncognito: () => ipcRenderer.invoke('open-incognito'),
  chromiumVersion: process.versions.chrome
});
