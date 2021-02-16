import './App.css';
import React, { MouseEventHandler, useEffect, useRef, useState } from 'react'
const { myIpcRenderer } = window

const constraints = {
    audio: {
        mandatory: {
        chromeMediaSource: 'desktop'
        }
    },
    video: {
        mandatory: {
        chromeMediaSource: 'desktop',
        }
    }
};


const Recorder : React.FunctionComponent = () => {

    const videoRef = useRef<HTMLVideoElement>(null)
    const audioRef = useRef<HTMLAudioElement>(null)
    const chunksRef = useRef<Blob[]>([])
    const recorderRef = useRef<MediaRecorder | null>()
    const [recording, setRecording] = useState<boolean>(false)

    
    const handleDataAvailable = (e : any) => {
        console.log(e.data)

    }

    useEffect(() => {
        myIpcRenderer.on('APP_saveSuccess', (result) => {
            let dir = localStorage.getItem('dir')
            if (dir) myIpcRenderer.send('APP_listFiles', dir)
        })
    }, []) 


    const prepareRecording = async () => {
        
        let stream : MediaStream | null = await navigator.mediaDevices.getUserMedia(constraints as any)
        stream.getVideoTracks()[0].stop()
        let audioStream : MediaStream = new MediaStream(stream.getAudioTracks())
        stream = null
        recorderRef.current = new MediaRecorder(audioStream, {mimeType: "audio/webm"})

        recorderRef.current.ondataavailable = (e) => {
            chunksRef.current = []
            chunksRef.current!.push(e.data)
        }
        recorderRef.current.onstop = async (e) => {
            let buffer : Buffer | null = Buffer.from(await chunksRef.current[0].arrayBuffer())

            audioStream.getTracks()[0].stop()
            console.log(audioStream.getTracks())
            myIpcRenderer.send('APP_saveRecording', buffer)
            buffer = null
        }                    
            
    }


    const record = (e: React.MouseEvent<HTMLButtonElement>) => {
        setRecording(true)
        prepareRecording().then( ()=> {
            recorderRef.current?.start()
        })
    }

    const stop = (e: React.MouseEvent<HTMLButtonElement>) => {
        setRecording(false)
        if (recorderRef.current?.state === 'recording') recorderRef.current?.stop()
        recorderRef.current = null
        chunksRef.current = []
    }
    

    return(
        <div id="recorder">
            <button onClick={record}>
                {recording && <div className="spinner">
                    <div className="double-bounce1"></div>
                    <div className="double-bounce2"></div>
                </div>
                }
                
                <p>{recording ? "Recording..." : "Record"}</p>
            </button>
            <button onClick={stop}>Stop Recording</button>
        </div>
    )

}

export default Recorder