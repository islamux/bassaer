"use strict";
const electron = require("electron");
const path = require("path");
const fs = require("fs");
function resolveProjectRoot() {
  if (process.env.PROJECT_ROOT) return process.env.PROJECT_ROOT;
  const envPath = path.join(__dirname, "../../.env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    const match = content.match(/^PROJECT_ROOT=(.+)$/m);
    if (match) return match[1].trim();
  }
  return process.cwd();
}
const PROJECT_ROOT = resolveProjectRoot();
const TRACKER_PATH = path.join(PROJECT_ROOT, "project-tracker.json");
let mainWindow = null;
let lastWriteTime = 0;
function createWindow() {
  mainWindow = new electron.BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1200,
    minHeight: 800,
    backgroundColor: "#0A0A10",
    titleBarStyle: "hiddenInset",
    trafficLightPosition: { x: 16, y: 16 },
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../renderer/index.html"));
  }
  mainWindow.once("ready-to-show", () => mainWindow?.show());
  electron.ipcMain.handle("tracker:read", () => {
    try {
      if (!fs.existsSync(TRACKER_PATH)) return null;
      return fs.readFileSync(TRACKER_PATH, "utf-8");
    } catch {
      return null;
    }
  });
  electron.ipcMain.handle("tracker:write", (_event, json) => {
    try {
      lastWriteTime = Date.now();
      fs.writeFileSync(TRACKER_PATH, json, "utf-8");
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  });
  electron.ipcMain.handle("tracker:path", () => TRACKER_PATH);
  electron.ipcMain.handle("tracker:fileInfo", () => {
    try {
      if (!fs.existsSync(TRACKER_PATH)) {
        return { exists: false, size: 0, lastModified: "", watcherActive: false };
      }
      const stat = fs.statSync(TRACKER_PATH);
      return {
        exists: true,
        size: stat.size,
        lastModified: stat.mtime.toISOString(),
        watcherActive: true
      };
    } catch {
      return { exists: false, size: 0, lastModified: "", watcherActive: false };
    }
  });
  let watcher = null;
  try {
    const dir = path.dirname(TRACKER_PATH);
    const filename = path.basename(TRACKER_PATH);
    watcher = fs.watch(dir, (eventType, changedFile) => {
      if (changedFile !== filename) return;
      if (Date.now() - lastWriteTime < 1e3) return;
      try {
        const content = fs.readFileSync(TRACKER_PATH, "utf-8");
        JSON.parse(content);
        mainWindow?.webContents.send("tracker:updated", content);
      } catch {
      }
    });
  } catch (err) {
    console.error("Failed to start file watcher:", err);
  }
  mainWindow.on("closed", () => {
    mainWindow = null;
    watcher?.close();
  });
}
electron.app.whenReady().then(createWindow);
electron.app.on("activate", () => {
  if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") electron.app.quit();
});
