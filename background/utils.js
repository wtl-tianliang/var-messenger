import { BrowserWindow } from "electron";
import { machineIdSync } from 'node-machine-id';

export function sendMessageToRender(message, data) {
  if (!message) {
    return;
  }
  const win = BrowserWindow.getFocusedWindow()
  win.webContents.send(message, data)
}

export function getDeviceId () {
  return machineIdSync(true)
}