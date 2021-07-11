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
    const [shadow, setShadow] = useState<boolean>(false)
    

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
            myIpcRenderer.send('APP_saveRecording', buffer)
            buffer = null
        }                    
            
    }

    const prepareShadow = async () => {
        let stream: MediaStream | null = await navigator.mediaDevices.getUserMedia(constraints as any)
        stream.getVideoTracks()[0].stop()
        let audioStream: MediaStream = new MediaStream(stream.getAudioTracks())
        stream = null
        recorderRef.current = new MediaRecorder(audioStream, { mimeType: "audio/webm" })
        let cache = new Array<Blob>(30)
        let start : Blob
        let hasStart = false

        const cacheChunk = (chunk : Blob) => {
            cache.push(chunk)
            cache.shift()
        }
    
        recorderRef.current.ondataavailable = (e) => {
            cacheChunk(e.data)
            if (!hasStart) {
                start = e.data // Save Recording header to add later else file wont work (Very messy but idk)
            }
            hasStart = true
        }
        recorderRef.current.onstop = async (e) => {
            let totalLength = 0
            for (let i = 0; i < cache.length; i++) {
                if (cache[i]) {
                    totalLength += cache[i].size
                }
            }
            let tmp = new Uint8Array(totalLength)
            let bufferOffset = 0
            tmp.set(new Uint8Array(await start.arrayBuffer()), 0)
            for (let i = 0; i < cache.length; i++) {
                
                let buffer
                if (cache[i]) {
                    buffer = await cache[i].arrayBuffer()
                    tmp.set(new Uint8Array(buffer), bufferOffset)
                    bufferOffset += buffer.byteLength
                }
            }

            let chunk = new Uint8Array(tmp.length + start.size)
            chunk.set(new Uint8Array(await start.arrayBuffer()), 0)
            chunk.set(tmp, start.size)
            
            //let buffer: Buffer | null = Buffer.from(await chunksRef.current[0].arrayBuffer())
            audioStream.getTracks()[0].stop()
            //console.log(await chunksRef.current[0].arrayBuffer())
            //myIpcRenderer.send('APP_saveRecording', Buffer.from(tmp.buffer))
            myIpcRenderer.send('APP_saveRecording', Buffer.from(chunk.buffer))

        }
    }

    const saveShadow = () => {
        if (recorderRef.current?.state === 'recording') recorderRef.current?.stop()
        recorderRef.current = null
        
    }

    const handleShadow = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!recording) {
           setShadow(true)
           prepareShadow().then(() => {
               recorderRef.current?.start(125)
           }) 
        }
    }

    const handleRecord = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (recording) {
            setRecording(false)
            if (recorderRef.current?.state === 'recording') recorderRef.current?.stop()
            recorderRef.current = null
            chunksRef.current = []
        } else if (shadow) {
            saveShadow()
            setShadow(false)
        } else {
            setRecording(true)
            prepareRecording().then(() => {
                recorderRef.current?.start()
            })
        }
    }
    

    return(
        <div id="recorder">
            <button className={shadow ? "btn-clicked" : ""} onClick={handleShadow}>Enable Shadow Record</button>
            <button className={shadow ? "btn-important" : ""}onClick={handleRecord}>
                {recording && <div className="spinner">
                    <div className="double-bounce1"></div>
                    <div className="double-bounce2"></div>
                </div>
                }
                
                {!shadow && <p>{recording ? "Stop" : "Record"}</p>}
                {shadow && <p>Save last 5 sec</p>}
            </button>
            
        </div>
    )

}

export default Recorder