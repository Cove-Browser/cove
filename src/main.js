const { app, BrowserWindow, ipcMain, session, nativeTheme, Menu, clipboard, shell, nativeImage, Tray, Notification, safeStorage } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

let mainWindow;

function createWindow() {
  const windowState = store.get('windowState', { width: 1280, height: 800 });

  mainWindow = new BrowserWindow({
    width: windowState.width,
    height: windowState.height,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#E8EDF5',
      symbolColor: '#1A1916',
      height: 40
    },
    backgroundColor: '#F4F6FB',
    icon: path.join(__dirname, '../icon-256.png'),
    show: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    }
  });

  Menu.setApplicationMenu(null);

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) {
    mainWindow.loadURL('http://localhost:8080');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.once('ready-to-show', () => mainWindow.show());
  mainWindow.on('resize', () => store.set('windowState', mainWindow.getBounds()));
  mainWindow.on('move', () => store.set('windowState', mainWindow.getBounds()));
  mainWindow.on('closed', () => { mainWindow = null; });

  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', errorCode, errorDescription, validatedURL);
  });

  // Block navigation to dangerous protocols
  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  // Block new window creation from the main frame
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('cove://')) return { action: 'allow' }
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  });

  // Prevent permission requests from being auto-granted
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    // Allow only these permissions
    const allowedPermissions = ['clipboard-read', 'clipboard-write'];
    callback(allowedPermissions.includes(permission));
  });
}

app.whenReady().then(() => {
  // Set up secure session for webviews
  const coveSession = session.fromPartition('persist:cove');

  // Block dangerous permission requests in webviews
  coveSession.setPermissionRequestHandler((webContents, permission, callback) => {
    const allowedPermissions = ['clipboard-read', 'clipboard-write', 'media', 'geolocation', 'notifications'];
    callback(allowedPermissions.includes(permission));
  });

  // CP2-10c: clear legacy dpapi-encrypted passwords, incompatible with safeStorage
  store.delete('passwords');

  createWindow();

  const trayIconPath = path.join(__dirname, '../icon-256.png');
  const tray = new Tray(trayIconPath);
  tray.setToolTip('Cove Browser');

  const trayMenu = Menu.buildFromTemplate([
    {
      label: 'Open Cove',
      click: () => {
        if (mainWindow) mainWindow.show();
        else createWindow();
      }
    },
    {
      label: 'New Incognito Window',
      click: () => {
        const incognitoWindow = new BrowserWindow({
          width: 1280,
          height: 800,
          frame: false,
          titleBarStyle: 'hidden',
          titleBarOverlay: {
            color: '#1A1F2E',
            symbolColor: '#F5F5F5',
            height: 40
          },
          webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            webviewTag: true,
            webSecurity: true,
            allowRunningInsecureContent: false,
            experimentalFeatures: false,
            partition: 'incognito',
            preload: path.join(__dirname, 'preload.js'),
            sandbox: true
          }
        });
        const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
        if (isDev) incognitoWindow.loadURL('http://localhost:8080?incognito=true');
        else incognitoWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { incognito: 'true' } });
        incognitoWindow.once('ready-to-show', () => incognitoWindow.show());

        // Block navigation to file:// URIs in incognito windows
        incognitoWindow.webContents.on('will-navigate', (event, url) => {
          if (url.startsWith('file://')) {
            event.preventDefault();
          }
        });

        // Block new window creation from incognito windows
        incognitoWindow.webContents.setWindowOpenHandler(({ url }) => {
          if (url.startsWith('cove://')) return { action: 'allow' }
          require('electron').shell.openExternal(url)
          return { action: 'deny' }
        });
      }
    },
    { type: 'separator' },
    {
      label: 'Quit Cove',
      click: () => app.quit()
    }
  ]);

  tray.setContextMenu(trayMenu);

  session.defaultSession.on('will-download', (event, item) => {
    const downloads = store.get('downloads', []);
    const dl = {
      id: Date.now().toString(),
      filename: item.getFilename(),
      url: item.getURL(),
      totalBytes: item.getTotalBytes(),
      receivedBytes: 0,
      state: 'progressing',
      startTime: Date.now()
    };
    downloads.unshift(dl);
    store.set('downloads', downloads);
    item.on('updated', (e, state) => {
      dl.state = state;
      dl.receivedBytes = item.getReceivedBytes();
      store.set('downloads', downloads);
    });
    item.once('done', (e, state) => {
      dl.state = state;
      dl.endTime = Date.now();
      store.set('downloads', downloads);
    });
  });
});

app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });

ipcMain.handle('store-get', (e, key) => store.get(key));
ipcMain.handle('store-set', (e, key, value) => { store.set(key, value); return true; });
ipcMain.handle('store-delete', (e, key) => { store.delete(key); return true; });
ipcMain.handle('window-minimize', () => mainWindow?.minimize());
ipcMain.handle('window-maximize', () => mainWindow?.isMaximized() ? mainWindow.unmaximize() : mainWindow?.maximize());
ipcMain.handle('window-close', () => mainWindow?.close());
ipcMain.handle('get-native-theme', () => nativeTheme.shouldUseDarkColors);
ipcMain.handle('set-titlebar-overlay', (e, opts) => mainWindow?.setTitleBarOverlay(opts));
ipcMain.handle('clear-session', async () => {
  const ses = session.defaultSession;
  await ses.clearCache();
  await ses.clearStorageData({
    storages: ['cookies', 'localstorage', 'sessionstorage', 'indexdb', 'websql', 'serviceworkers', 'cachestorage']
  });
  return true;
});

ipcMain.handle('get-version', () => '2.0.0 BETA');
ipcMain.handle('copy-to-clipboard', (event, text) => {
  clipboard.writeText(text);
});
ipcMain.handle('read-clipboard', () => {
  return clipboard.readText();
});
ipcMain.handle('save-image', async (event, url) => {
  try {
    await session.defaultSession.downloadURL(url);
    return true;
  } catch (error) {
    console.error('Failed to save image:', error);
    return false;
  }
});
ipcMain.handle('copy-image', async (event, url) => {
  try {
    const response = await fetch(url);
    const buffer = await response.arrayBuffer();
    const image = nativeImage.createFromBuffer(Buffer.from(buffer));
    clipboard.writeImage(image);
    return true;
  } catch (error) {
    console.error('Failed to copy image:', error);
    return false;
  }
});
ipcMain.handle('check-for-updates', async () => {
  try {
    const response = await fetch('https://api.github.com/repos/Cove-Browser/cove/releases');
    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      return data[0]; // Return the most recent release (index 0)
    }
    throw new Error('No releases found');
  } catch (error) {
    console.error('Failed to check for updates:', error);
    throw error;
  }
});
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});
ipcMain.handle('set-background-color', (event, color) => {
  if (mainWindow) {
    mainWindow.setBackgroundColor(color);
  }
});
ipcMain.handle('get-cookies', async () => {
  return await session.defaultSession.cookies.get({});
});
ipcMain.handle('clear-cookies', async () => {
  const cookies = await session.defaultSession.cookies.get({});
  for (const cookie of cookies) {
    const url = `http${cookie.secure ? 's' : ''}://${cookie.domain.replace(/^\./, '')}${cookie.path}`;
    await session.defaultSession.cookies.remove(url, cookie.name);
  }
  return true;
});
ipcMain.handle('export-data', async (event) => {
  const senderUrl = event.senderFrame.url
  if (!senderUrl.startsWith('cove://') && !senderUrl.startsWith('file://')) {
    throw new Error('Unauthorized IPC call origin')
  }
  const { dialog } = require('electron');
  const fs = require('fs');
  
  // Get browsing data (history)
  const history = store.get('history', []);
  
  // Get bookmarks
  const bookmarks = store.get('bookmarks', []);
  
  // Get user display name
  const displayName = store.get('displayName');
  
  // Get and decrypt passwords from Cove Password Manager
  const passwords = store.get('passwords', []);
  const decryptedPasswords = [];

  if (safeStorage.isEncryptionAvailable()) {
    for (const passwordEntry of passwords) {
      try {
        const encryptedBuffer = Buffer.from(passwordEntry.encryptedPassword, 'base64');
        let decryptedPassword = safeStorage.decryptString(encryptedBuffer);
        decryptedPasswords.push({
          title: passwordEntry.title,
          password: decryptedPassword
        });
        decryptedPassword = null;
      } catch (error) {
        console.error('Failed to decrypt password for export:', error);
      }
    }
  }
  
  // Get all other store data not already covered
  const allStoreKeys = Object.keys(store.store);
  const excludedKeys = ['history', 'bookmarks', 'displayName', 'passwords'];
  const otherData = {};
  
  for (const key of allStoreKeys) {
    if (!excludedKeys.includes(key)) {
      otherData[key] = store.get(key);
    }
  }
  
  const exportData = {
    exportedAt: new Date().toISOString(),
    browsingData: history,
    bookmarks: bookmarks,
    userDisplayName: displayName,
    passwords: decryptedPasswords,
    otherData: otherData
  };
  
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow, {
    defaultPath: 'cove-data-export.json',
    filters: [
      { name: 'JSON Files', extensions: ['json'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  });
  
  if (canceled || !filePath) {
    return { success: false, message: 'Export cancelled' };
  }
  
  fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8');
  
  return { success: true, message: 'Data exported successfully', path: filePath };
});

ipcMain.handle('show-notification', (event, title, body) => {
  new Notification({ title, body }).show();
});

// CP2-6 FIX: Search Suggestions dropdown was not appearing due to CORS blocking
// direct fetch from renderer. Fixed by adding IPC handler to proxy fetch requests
// through the main process, which bypasses CORS restrictions.
ipcMain.handle('fetch-search-suggestions', async (event, query, engine) => {
  try {
    let apiUrl;
    if (engine === 'google') {
      apiUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    } else if (engine === 'duckduckgo') {
      apiUrl = `https://duckduckgo.com/ac/?q=${encodeURIComponent(query)}&type=list`;
    } else if (engine === 'bing') {
      apiUrl = `https://api.bing.com/osjson.aspx?query=${encodeURIComponent(query)}`;
    } else {
      apiUrl = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    }

    const response = await fetch(apiUrl);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Failed to fetch search suggestions:', error);
    return null;
  }
});

ipcMain.handle('open-incognito', () => {
  const incognitoWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1A1F2E',
      symbolColor: '#F5F5F5',
      height: 40
    },
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableRemoteModule: false,
      webviewTag: true,
      webSecurity: true,
      allowRunningInsecureContent: false,
      experimentalFeatures: false,
      partition: 'incognito',
      preload: path.join(__dirname, 'preload.js'),
      sandbox: true
    }
  });
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) incognitoWindow.loadURL('http://localhost:8080?incognito=true');
  else incognitoWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { incognito: 'true' } });
  incognitoWindow.once('ready-to-show', () => incognitoWindow.show());

  // Block navigation to file:// URIs in incognito windows
  incognitoWindow.webContents.on('will-navigate', (event, url) => {
    if (url.startsWith('file://')) {
      event.preventDefault();
    }
  });

  // Block new window creation from incognito windows
  incognitoWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('cove://')) return { action: 'allow' }
    require('electron').shell.openExternal(url)
    return { action: 'deny' }
  });
});

// Cove Password Manager - Encryption/Decryption using Electron safeStorage
ipcMain.handle('encrypt-password', (event, password) => {
  const senderUrl = event.senderFrame.url;
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const isAllowedOrigin =
    senderUrl.startsWith('cove://') ||
    senderUrl.startsWith('file://') ||
    (isDev && senderUrl.startsWith('http://localhost'));
  if (!isAllowedOrigin) {
    throw new Error('Unauthorized IPC call origin');
  }
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Encryption is not available on this system');
  }
  const encryptedBuffer = safeStorage.encryptString(password);
  return encryptedBuffer.toString('base64');
});

ipcMain.handle('decrypt-password', (event, encryptedBase64) => {
  const senderUrl = event.senderFrame.url;
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  const isAllowedOrigin =
    senderUrl.startsWith('cove://') ||
    senderUrl.startsWith('file://') ||
    (isDev && senderUrl.startsWith('http://localhost'));
  if (!isAllowedOrigin) {
    throw new Error('Unauthorized IPC call origin');
  }
  if (!safeStorage.isEncryptionAvailable()) {
    throw new Error('Decryption is not available on this system');
  }
  const encryptedBuffer = Buffer.from(encryptedBase64, 'base64');
  let decryptedString = safeStorage.decryptString(encryptedBuffer);
  const result = decryptedString;
  decryptedString = null;
  return result;
});
