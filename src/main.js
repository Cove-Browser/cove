const { app, BrowserWindow, ipcMain, protocol, session, nativeTheme, Menu } = require('electron');
const path = require('path');
const Store = require('electron-store');
const store = new Store();

let mainWindow;

protocol.registerSchemesAsPrivileged([{
  scheme: 'cove',
  privileges: { standard: true, secure: true, allowServiceWorkers: true, supportFetchAPI: true, corsEnabled: true }
}]);

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
      color: '#D4C9A8',
      symbolColor: '#2C2410',
      height: 40
    },
    icon: path.join(__dirname, '../icon-256-rounded.png'),
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
      sandbox: false // must be false for preload to work with contextBridge
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
    if (!url.startsWith('http://localhost:8080') && 
        !url.startsWith('file://') &&
        !url.startsWith('cove://')) {
      event.preventDefault();
    }
  });

  // Block new window creation from the main frame
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    return { action: 'deny' };
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


  createWindow();

  protocol.registerFileProtocol('cove', (request, callback) => {
    callback({ path: path.join(__dirname, '../dist/index.html') });
  });

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

ipcMain.handle('open-incognito', () => {
  const incognitoWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: false,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#1a1a2e',
      symbolColor: '#F0EDE4',
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
      sandbox: false
    }
  });
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev) incognitoWindow.loadURL('http://localhost:8080?incognito=true');
  else incognitoWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { incognito: 'true' } });
  incognitoWindow.once('ready-to-show', () => incognitoWindow.show());
});
