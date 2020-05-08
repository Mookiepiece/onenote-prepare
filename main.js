const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');
const { format } = require('url');

const isDevelopment = process.env&&process.env.NODE_ENV === 'development'

let mainWindow;

function createMainWindow() {
  const window = new BrowserWindow({
    frame:false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDevelopment) {
    window.webContents.openDevTools({
      mode: 'undocked'
    })
  }

  if (isDevelopment) {
    // windows, load react devtools
    BrowserWindow.addDevToolsExtension(path.resolve(process.env.LOCALAPPDATA +"/Google/Chrome/User Data/Default/Extensions/fmkadmapgofadopljbjfkapdkoienihi/4.6.0_0"))
    window.loadURL(`http://localhost:9001`)
  }
  else {
    window.loadURL(format({
      pathname: path.join(__dirname, './dist/index.html'),
      protocol: 'file',
      slashes: true
    }))
  }

  window.on('closed', () => {
    mainWindow = null
  })

  window.webContents.on('devtools-opened', () => {
    window.focus()
    setImmediate(() => {
      window.focus()
    })
  })

  return window
}

ipcMain.on('max', _ => {
  if (!mainWindow.isDestroyed()) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

// quit application when all windows are closed
app.on('window-all-closed', () => {
  // on macOS it is common for applications to stay open until the user explicitly quits
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // on macOS it is common to re-create a window even after all windows have been closed
  if (mainWindow === null) {
    mainWindow = createMainWindow()
  }
})

// create main BrowserWindow when electron is ready
app.on('ready', () => {
  mainWindow = createMainWindow()
})
