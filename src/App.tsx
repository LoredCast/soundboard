import './App.css';
import React, { useEffect, useState } from 'react'
import Controller from './controller'
import { Settings } from './Settings';
const { myIpcRenderer } = window


const Menu : React.FunctionComponent = () => {
    const [showSettings, setShowSettings] = useState(false)

    const handleClose = () => {
        myIpcRenderer.invoke('APP_close')
    }

    const handleMin = () => {
        myIpcRenderer.invoke('APP_min')
    }

    const handleSettings = () => {
        setShowSettings(!showSettings)
    }

    

    return(<header>
        
        <div className="option" onClick={handleClose}>X</div>
        <div className="option" onClick={handleMin}>-</div>
        <div className="option-light" onClick={handleSettings}><div>...</div></div>
        { showSettings && <Settings toggle={handleSettings}></Settings> }
    </header>)
}

const Version : React.FunctionComponent = () => {
    const [versionText, setVersionText] = useState<string>('pending')

    useEffect(() => {
        myIpcRenderer.send('APP_getVersion')

        myIpcRenderer.on('APP_currentVersion', (info) => {
            setVersionText(info)
        })
    }, [])

    return(
        <div id="version"><h1>version {versionText}</h1></div>
    )
}

const App : React.FunctionComponent = () => {
    

    return(
        <div>
            
            <Menu/>
            <Controller/>
            <Version/>
        </div>
    )
}

export default App;

