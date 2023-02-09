import { BrowserWindow } from "electron";

export function sendMessageToRender(message, data) {
  if (!message) {
    return;
  }
  const win = BrowserWindow.getFocusedWindow()
  win.webContents.send(message, data)
}
