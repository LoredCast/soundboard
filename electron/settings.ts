import { ipcMain, app } from "electron";
import Store from 'electron-store'

const store = new Store()
const path = app.getPath('userData')

function saveConfig(key, value) {
    console.log(key, path)
}

export default saveConfig