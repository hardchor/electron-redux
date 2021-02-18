import path from 'path'
import url from 'url'
import { app, BrowserWindow } from 'electron'
import { stateSyncEnhancer } from 'electron-redux'
import { createStore } from 'redux'
import { rootReducer } from '../store'

const isDevelopment = process.env.NODE_ENV !== 'production'

const store = createStore(rootReducer, stateSyncEnhancer())

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null

async function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
        },
    })

    if (isDevelopment) {
        mainWindow.webContents.openDevTools()
    }

    if (isDevelopment) {
        await mainWindow.loadURL(`http://localhost:${process.env.ELECTRON_WEBPACK_WDS_PORT}`)
    } else {
        await mainWindow.loadURL(
            url.format({
                pathname: path.join(__dirname, '../renderer/index.html'),
                protocol: 'file',
                slashes: true,
            })
        )
    }
    render()

    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        mainWindow = null
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

const render = () => {
    if (mainWindow) {
        const { globalCounter, localCounter } = store.getState()
        mainWindow.setTitle(`Global counter: [${globalCounter}] | Local counter: [${localCounter}]`)
    }
}

store.subscribe(render)
