declare module "wangeditor-plugin-var";
declare interface Window {
  ipcRenderer: {
    on: (name: string, listener: (event: string, data: any) => void) => {};
    invoke: (name: string, ...args: any[]) => Promise<any>;
  };
  funs: {
    copy: (text: string) => void;
    openURL: (url: string) => void;
  };
}
