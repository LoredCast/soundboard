import path from 'path'
import isDev from'electron-is-dev'
import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import fs from 'fs'
import mime from 'mime'
import { IpcMainEvent } from 'electron/main'
import { autoUpdater } from "electron-updater"

class AppUpdater {
  constructor() {
    autoUpdater.checkForUpdatesAndNotify()
  }
}

export default class Main {
    static mainWindow: Electron.BrowserWindow;
    static application: Electron.App;
    static BrowserWindow;
    static HotkeyEvent : IpcMainEvent

    private static onWindowAllClosed() {
        if (process.platform !== 'darwin') {
            Main.application.quit();
        }
    }

    private static onClose() {
        // Dereference the window object. 
        // Main.mainWindow = null;
        console.log("closed")
    }

    private static onReady() {
        Main.mainWindow = new Main.BrowserWindow({ 
            width: 1460, 
            height: 1000,
            minWidth: 760,
            minHeight: 50,
            frame: isDev ? true : false,
            webPreferences: {
                nodeIntegration: false,
                contextIsolation: true,
                enableRemoteModule: false,
                preload: path.join(__dirname, 'preload.js')
    } 
        });
        Main.mainWindow.loadURL(isDev ? 'http://localhost:3000' : `file://${path.join(__dirname, '../build/index.html')}`);
        Main.mainWindow.on('closed', Main.onClose);
        const updater = new AppUpdater()
        //Main.mainWindow.removeMenu()
        console.log(app.getPath('userData'))
    }

    private static listenerFileSelection() {
        // -------------------------------------
        // Important handler for selecting the directory containing the audio files
        // Response Object contains the Selection path and all the audio files in the dir
        // -------------------------------------

        ipcMain.handle('APP_showDialog', (event, ...args) => {  
            let dir : string = ''
            var paths : string[] = []
            var fileNames : string[] = []
            
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
                                fileNames.push(file)
                            }
                        }

                        let load = {
                            paths: paths,
                            fileNames: fileNames
                        }

                        event.sender.send('APP_dialogResponse', load)
                    })
                }
            }).catch((err) => {
                console.log(err)
            })
        });
    }


    private static listenerClose() {
        ipcMain.handle('APP_close', (event, ...args) => {
            Main.mainWindow.close()
        })
    }


    private static listenerMin() {
        ipcMain.handle('APP_min', (event, ...args) => {
            Main.mainWindow.minimize()
        })
    }


    private static listenerHotkey() {
        let keys : string[] = [] // Keep track of keys 
        let names : string[] = [] // Corrosponding File Names for Shortcuts

        ipcMain.on('APP_setkey', (event, key : string, title : string, ...args) => {
            
            let keyIndex = names.indexOf(title) // Check if a Shortcut is already registered 
            if (keyIndex !== -1) {
                try {
                  globalShortcut.unregister(keys[keyIndex]) // delete old Hotkey
                } catch {
                    console.log("Failed")
                }
                keys[keyIndex] = key
            } else {
                names.push(title) // If Hotkey is new, add it to the lists
                keys.push(key)
            }

            try {
                globalShortcut.register(key, () => {
                    event.reply('APP_keypressed', key)
                })
            } catch (error) {
                console.log(error)
            }
        })
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
        this.listenerFileSelection()
        this.listenerHotkey()
        this.listenerClose()
        this.listenerMin()
    }
}



Main.main(app, BrowserWindow)

