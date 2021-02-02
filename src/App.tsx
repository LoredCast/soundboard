import './App.css';
import React, {useEffect, useState} from 'react'
import Controller from './controller';

const { myIpcRenderer } = window

export interface ExtendedAudioElement extends HTMLAudioElement {
	setSinkId: (sinkId: string) => Promise<void>;
}

const App : React.FunctionComponent = () => {
    const [path, setPath] = useState('no path selected')
    useEffect(() => {
        myIpcRenderer.invoke('APP_showDialog')
        myIpcRenderer.on('APP_dialogResponse', (result) => {
           setPath(result)
        })
    }, [])

    return(
        <div>
            <p>{ path }</p>
            <Controller/>
        </div>
    )
}

export default App;

