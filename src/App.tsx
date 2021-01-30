import './App.css';
import React from 'react'
import { useRef, useState, useEffect } from 'react'

interface ExtendedAudioElement extends HTMLAudioElement {
	setSinkId: (sinkId: string) => Promise<void>;
}

const App : React.FunctionComponent = () => {
    const audioRef = useRef<ExtendedAudioElement>(null)
   
    const [outputs, setOutputs] = useState<MediaDeviceInfo[]>()
    const [selectedOutput, setSelectedOutput] = useState<string>('default')


    const setupAudio = () => {
        navigator.getUserMedia({video:false, audio:true}, (stream) => {
            let obj = audioRef.current!
            obj.srcObject = stream

        }, (e) => {
            console.log(e)
        })
    }

    const handleOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedOutput(event.currentTarget.value)
        let obj = audioRef.current!
        obj.setSinkId(event.currentTarget.value)
    }

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then( devices => {
                devices = devices.filter((output) => output.kind === "audiooutput")
                setOutputs(devices)
            })
    }, []) 

    return(
        <div>
            <h1>Webcam</h1>
            <select onChange={ handleOutputChange }>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>
            <p>Selected Device: {selectedOutput} </p>
            <audio ref={audioRef} controls>
            <source src="/home/manuel/Desktop/untitled.mp3" type="audio/mpeg"/>
            </audio>
            </div>
    )
}

export default App;

