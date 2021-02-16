import path from 'path'
import isDev from'electron-is-dev'
import { app, BrowserWindow, ipcMain, dialog, globalShortcut } from 'electron'
import fs from 'fs'
import mime from 'mime'
import { IpcMainEvent } from 'electron/main'
import { autoUpdater } from "electron-updater"

const fspromise = fs.promises

interface Bind {
    key:string,
    name:string
}


class AppUpdater {
  constructor() {
    
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
        setInterval(() => {autoUpdater.checkForUpdatesAndNotify()}, 10000)
    }

    private static async listAudioFiles(dir : string) {
        let paths : string[] = []
        let fileNames : string[] = []

        await fspromise.readdir(dir).then((files)  => {
            for (const file of files) {
                let filePath = path.join(dir, file)
                if (mime.getType(filePath) === 'audio/mpeg' || mime.getType(filePath) === 'audio/wav') {
                    paths.push(path.join(dir, file))
                    fileNames.push(file)
                }
            }
            
        })

        return [paths, fileNames]
    
    }

    private static listenerListFiles() {
        ipcMain.on('APP_listFiles', (event, dir) => {
            this.listAudioFiles(dir).then(([paths, files]) => {
                let load = {
                    dir: dir, 
                    paths: paths,
                    fileNames: files
                }

                event.sender.send('APP_listedFiles', load)
            })
        })
    }

    private static listenerFileSelection() {
        // -------------------------------------
        // Important handler for selecting the directory containing the audio files
        // Response Object contains the Selection path and all the audio files in the dir
        // -------------------------------------

        ipcMain.handle('APP_showDialog', (event, ...args) => {  
            let dir : string = ''

            dialog.showOpenDialog({properties: ['openDirectory']})
            .then((result) => {
                dir = result.filePaths[0]
                if (dir) {
                    this.listAudioFiles(dir).then(([paths, files]) => {
                        let load = {
                            dir: dir,
                            paths: paths,
                            fileNames: files
                        }

                        event.sender.send('APP_listedFiles', load)
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

        let bindings : Bind[] = []

        ipcMain.on('APP_setkey', (event, key : string, title : string, ...args) => {
            
            let keyIndex = names.indexOf(title) // Check if a Shortcut is already registered 
            let exists = false

            for (let bind of bindings) {
                if (bind.name === title) {
                    exists = true
                    try {
                        globalShortcut.unregister(bind.key) // delete old Hotkey
                    } catch {
                        console.log("Failed")
                    }
                    bind.key = key
                }
            }

            if (!exists) {
                bindings.push({
                    key: key,
                    name: title
                })
            }


            try {
                globalShortcut.register(key, () => {
                    event.reply('APP_keypressed', key)
                })
            } catch (error) {
                console.log(error)
            }

            console.log(bindings)
        })
    }


    private static listenerRecording() {
        ipcMain.on('APP_saveRecording', async (event, data) => {
            const { filePath } = await dialog.showSaveDialog({
                buttonLabel: 'Save Audio',
                defaultPath: `audio-${Date.now()}.wav`
            })

            if (filePath) fspromise.writeFile(filePath, data)
                .then(event.reply('APP_saveSuccess', true))
                .catch((e) => console.log(e))
        } )
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
        this.listenerRecording()
        this.listenerListFiles()
    }
}



Main.main(app, BrowserWindow)

