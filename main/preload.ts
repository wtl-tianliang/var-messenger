import { contextBridge, ipcRenderer, shell, clipboard } from "electron";

contextBridge.exposeInMainWorld("ipcRenderer", {
  invoke: (name: string, ...args: any[]) => {
    return ipcRenderer.invoke(name, ...args)
  },
  on: (event: string, listener: (...args: any[]) => void) => {
    ipcRenderer.on(event, listener);
  },
});

contextBridge.exposeInMainWorld("funs", {
  copy(text: string) {
    clipboard.writeText(text)
  },
  openURL(url: string) {
    shell.openExternal(url)
  }
})
