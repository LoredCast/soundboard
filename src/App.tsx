import './App.css';
import React, {useEffect, useRef, useState} from 'react'
import Controller from './controller';
import { chrome } from 'process';
const { myIpcRenderer } = window


export interface ExtendedAudioElement extends HTMLAudioElement {
	setSinkId: (sinkId: string) => Promise<void>;
}

const mediaDevices = navigator.mediaDevices as any;

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


const constraints = {
    
}




const App : React.FunctionComponent = () => {
    const captureRef = useRef<HTMLVideoElement>(null)

    const handleStream = (stream : any) => {
        let audio = captureRef.current!

        audio.srcObject = stream
        audio.onloadedmetadata = (_) => audio.play()

    }

    const audioCapture = () => {

        myIpcRenderer.getSources({ types: ['window', 'screen'] }).then(async sources => {
            for (const source of sources) {

                console.log(source)
              if (source.name === "Entire Screen") {
                try {
                  const stream = await mediaDevices.getUserMedia({
                    audio: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: 'default'
                        }
                    },
                    video: {
                        mandatory: {
                            chromeMediaSource: 'desktop',
                            chromeMediaSourceId: source.id,
                            minWidth: 500,
                            maxWidth: 600,

                        }
                    }
                  })

                  handleStream(stream)
                } catch (e) {
                  console.log(e)
                }
                return
              }
            }
          })
    }



    useEffect(() => {
        audioCapture()
        navigator.mediaDevices.enumerateDevices().then((val) => {
            console.log(val)
        })
    }, [])

    return(
        <div>
            <Menu/>
            <Controller/>
            <video controls ref= {captureRef}></video>
        </div>

    )
}

export default App;

