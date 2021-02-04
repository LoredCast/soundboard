import './App.css';
import React, {useEffect, useRef, useState} from 'react'
import Controller from './controller';
import { chrome } from 'process';
const { myIpcRenderer } = window


export interface ExtendedAudioElement extends HTMLAudioElement {
	setSinkId: (sinkId: string) => Promise<void>;
}

const mediaDevices = navigator.mediaDevices as any;
declare var MediaRecorder: any;

const Menu : React.FunctionComponent = () => {
    const handleClose = () => {
        myIpcRenderer.invoke('APP_close')
    }

    const handleMin = () => {
        myIpcRenderer.invoke('APP_min')
    }

    return(<header>
        <div className="option" onClick={handleClose}>X</div>
        <div className="option" onClick={handleMin}>-</div>
    </header>)
}





const App : React.FunctionComponent = () => {


    useEffect(() => {
    }, [])

    return(
        <div>
            <Menu/>
            <Controller/>

        </div>

    )
}

export default App;

