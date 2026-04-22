"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("api", {
  platform: process.platform,
  tracker: {
    read: () => electron.ipcRenderer.invoke("tracker:read"),
    write: (json) => electron.ipcRenderer.invoke("tracker:write", json),
    getPath: () => electron.ipcRenderer.invoke("tracker:path"),
    getFileInfo: () => electron.ipcRenderer.invoke("tracker:fileInfo"),
    onUpdated: (cb) => {
      const handler = (_event, json) => cb(json);
      electron.ipcRenderer.on("tracker:updated", handler);
      return () => electron.ipcRenderer.removeListener("tracker:updated", handler);
    }
  }
});
