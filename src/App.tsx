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
        
    }, [])

    return(
        <div>
            <p>{ path }</p>
            <Controller/>
            <input type="file" accept="video/*"/>
        </div>
    )
}

export default App;

