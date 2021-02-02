import path from 'path'
import isDev from'electron-is-dev'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;
    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object. 
        //Main.mainWindow = null;
        console.log("closed")
    }

    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({ 
            width: 800, 
            height: 600,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
    } 
        });
        Main.mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
        Main.mainWindow.on('closed', Main.onClose);
        console.log("hi")
    }


        

    static main(app: Electron.App, browserWindow: typeof BrowserWindow) {
        // we pass the Electron.App object and the  
        // Electron.BrowserWindow into this function 
        // so this class has no dependencies. This 
        // makes the code easier to write tests for 
        Main.BrowserWindow = browserWindow;
        Main.application = app;
        Main.application.on('window-all-closed', Main.onWindowAllClosed);
        Main.application.on('ready', Main.onReady);
        console.log("Changed Again")
        
        ipcMain.handle('APP_showDialog', (event, ...args) => {  
            let paths : String[] = [] 
            dialog.showOpenDialog({properties: ['openDirectory']})
            .then((result) => {
                paths = result.filePaths
                console.log(paths[0])
                event.sender.send('APP_dialogResponse', paths[0])
            })
            
        });
    }
}


Main.main(app, BrowserWindow)

