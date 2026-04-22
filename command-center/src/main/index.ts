import { app, BrowserWindow, ipcMain } from 'electron'
import path from 'path'
import fs from 'fs'
import { TRACKER_PATH } from './config'

let mainWindow: BrowserWindow | null = null
let lastWriteTime = 0

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: '#0A0A10',
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL)
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }

  mainWindow.once('ready-to-show', () => mainWindow?.show())

  ipcMain.handle('tracker:read', () => {
    try {
      if (!fs.existsSync(TRACKER_PATH)) return null
      return fs.readFileSync(TRACKER_PATH, 'utf-8')
    } catch {
      return null
    }
  })

  ipcMain.handle('tracker:write', (_event, json: string) => {
    try {
      lastWriteTime = Date.now()
      fs.writeFileSync(TRACKER_PATH, json, 'utf-8')
      return { success: true }
    } catch (err: any) {
      return { success: false, error: err.message }
    }
  })

  ipcMain.handle('tracker:path', () => TRACKER_PATH)

  ipcMain.handle('tracker:fileInfo', () => {
    try {
      if (!fs.existsSync(TRACKER_PATH)) {
        return { exists: false, size: 0, lastModified: '', watcherActive: false }
      }
      const stat = fs.statSync(TRACKER_PATH)
      return {
        exists: true,
        size: stat.size,
        lastModified: stat.mtime.toISOString(),
        watcherActive: true
      }
    } catch {
      return { exists: false, size: 0, lastModified: '', watcherActive: false }
    }
  })

  let watcher: fs.FSWatcher | null = null
  try {
    const dir = path.dirname(TRACKER_PATH)
    const filename = path.basename(TRACKER_PATH)
    watcher = fs.watch(dir, (eventType, changedFile) => {
      if (changedFile !== filename) return
      if (Date.now() - lastWriteTime < 1000) return
      try {
        const content = fs.readFileSync(TRACKER_PATH, 'utf-8')
        JSON.parse(content)
        mainWindow?.webContents.send('tracker:updated', content)
      } catch {
        // Ignore corrupt JSON
      }
    })
  } catch (err) {
    console.error('Failed to start file watcher:', err)
  }

  mainWindow.on('closed', () => {
    mainWindow = null
    watcher?.close()
  })
}

app.whenReady().then(createWindow)

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
