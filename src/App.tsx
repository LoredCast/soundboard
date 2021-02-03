import './App.css';
import React, {useEffect, useState} from 'react'
import Controller from './controller';


const { myIpcRenderer } = window

export interface ExtendedAudioElement extends HTMLAudioElement {
	setSinkId: (sinkId: string) => Promise<void>;
}

const App : React.FunctionComponent = () => {
    useEffect(() => {
        
    }, [])

    return(
        <div>
            <Controller/>
        </div>
    )
}

export default App;

