import path from 'path'
import isDev from'electron-is-dev'
import { app, BrowserWindow, ipcMain, dialog } from 'electron'
import fs from 'fs'
import mime from 'mime'

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
                frame:false,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
    } 
        });
        Main.mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
        Main.mainWindow.on('closed', Main.onClose);
        //Main.mainWindow.removeMenu()
        console.log(app.getPath('userData'))
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
        
        ipcMain.handle('APP_showDialog', (event, ...args) => {  
            let dir : string = ''
            var paths : string[] = []
            
            dialog.showOpenDialog({properties: ['openDirectory']})
            .then((result) => {
                dir = result.filePaths[0]

                if (dir) {
                    fs.readdir(dir, (err, files) => {
                        if (err) {
                            console.log(err)
                        }
                        for (const file of files) {
                            let filePath = path.join(dir, file)
                            if (mime.getType(filePath) === 'audio/mpeg') {
                                paths.push(path.join(dir, file))
                            }
                        }
                        event.sender.send('APP_dialogResponse', paths)
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
            
        });

        ipcMain.handle('APP_close', (event, ...args) => {
            Main.mainWindow.close()
        })


        ipcMain.handle('APP_min', (event, ...args) => {
            Main.mainWindow.minimize()
        })

    }
}


Main.main(app, BrowserWindow)

