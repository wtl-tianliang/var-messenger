import { machineIdSync } from 'node-machine-id';

export function sendMessageToRender(webContents, message, data) {
  if (!message) {
    return;
  }
  webContents.send(message, data)
}

export function getDeviceId () {
  return machineIdSync(true)
}