"use strict";

import { app, protocol, BrowserWindow, screen, Menu, ipcMain } from "electron";
import { createProtocol } from "vue-cli-plugin-electron-builder/lib";
import { autoUpdater } from "electron-updater";
import { version } from "../package.json";

import "../background/main.js";
import { initDB } from "../background/src/db/index";

let mainWinId = null // 主窗口ID

function sendUpdateMessage(type, message) {
  const win = BrowserWindow.fromId(mainWinId);
  win.webContents.send("UPDATE_MESSAGE", { type, message });
}

autoUpdater.currentVersion = version;
autoUpdater.setFeedURL("https://www.oddtools.cn/download/var-messenger/");

autoUpdater.on("update-available", () => {
  console.log("update-available");
});

autoUpdater.on("update-not-available", () => {
  console.log("update-not-available");
});

autoUpdater.on("download-progress", (info) => {
  console.log("update-download-progress", info.percent);
});

autoUpdater.on("update-downloaded", () => {
  console.log("update-downloaded");
  sendUpdateMessage("update-downloaded");
});

autoUpdater.on("error", (err, message) => {
  console.log("upload-error", message);
});

ipcMain.handle("update-install", () => {
  autoUpdater.quitAndInstall();
});

const isDevelopment = process.env.NODE_ENV !== "production";
// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { secure: true, standard: true } },
]);

Menu.setApplicationMenu(null);

ipcMain.handle("openDevtools", (event) => {
  event.sender.openDevTools();
});

async function createWindow() {
  // Init database
  await initDB();

  // Create the browser window.
  const display = screen.getDisplayNearestPoint(screen.getCursorScreenPoint());
  const win = new BrowserWindow({
    width: Math.min(display.workAreaSize.width * 0.8, 1300),
    height: Math.min(display.workAreaSize.height * 0.9, 900),
    minWidth: 800,
    minHeight: 600,
    center: true,
    titleBarOverlay: {
      color: "#e8eaed",
      symbolColor: "#b19b70",
      height: 40,
    },
    titleBarStyle: "hidden",
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION,
    },
  });

  mainWinId = win.id

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL);
    if (!process.env.IS_TEST) win.webContents.openDevTools();
  } else {
    createProtocol("app");
    // Load the index.html when not in development
    win.loadURL("app://./index.html");
  }
}

// Quit when all windows are closed.
app.on("window-all-closed", () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", async () => {
  await createWindow();
  await autoUpdater.checkForUpdates();
});

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === "win32") {
    process.on("message", (data) => {
      if (data === "graceful-exit") {
        app.quit();
      }
    });
  } else {
    process.on("SIGTERM", () => {
      app.quit();
    });
  }
}
