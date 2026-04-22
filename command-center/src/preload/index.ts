import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('api', {
  platform: process.platform,
  tracker: {
    read: () => ipcRenderer.invoke('tracker:read'),
    write: (json: string) => ipcRenderer.invoke('tracker:write', json),
    getPath: () => ipcRenderer.invoke('tracker:path'),
    getFileInfo: () => ipcRenderer.invoke('tracker:fileInfo'),
    onUpdated: (cb: (json: string) => void) => {
      const handler = (_event: any, json: string) => cb(json)
      ipcRenderer.on('tracker:updated', handler)
      return () => ipcRenderer.removeListener('tracker:updated', handler)
    }
  }
})
