import { DesktopCapturer }  from 'electron'
declare global {
    interface Window {
        myIpcRenderer: MyIpcRenderer
    }
}

export interface MyIpcRenderer {
    invoke(channel: string, ...args: any[]): Promise<any>;
    send(channel: string, ...args: any[]): void;
    
    /** @return A function that removes this listener. */
    on(channel: string, listener: (...args: any[]) => void): () => void;
    
    getSources(options: Electron.SourcesOptions): Promise<Electron.DesktopCapturerSource[]>;
}

export interface MyCapturer {
  
}