import React, {useEffect, useRef} from 'react'
import { ExtendedAudioElement } from './App' 

type padProps = {
    outputs : string[]
    source: string,
    name: string | undefined
}

const Pad : React.FunctionComponent<padProps> = (props : padProps) => {
    const primaryAudioRef = useRef<ExtendedAudioElement>(null) 
    const secondaryAudioRef = useRef<ExtendedAudioElement>(null)

    const setPrimaryOutput = (output : string) => {
        primaryAudioRef.current?.setSinkId(output)
    }


    const setSecondaryOutput = (output : string) => {
        secondaryAudioRef.current?.setSinkId(output)
    }

    const play = () => {
        if (primaryAudioRef.current?.paused) {
            primaryAudioRef.current?.play()
            secondaryAudioRef.current?.play()
        } else {
            primaryAudioRef.current?.pause()
            primaryAudioRef.current!.currentTime = 0
            secondaryAudioRef.current?.pause()
            secondaryAudioRef.current!.currentTime = 0

        }
        
        
    }
    
    useEffect(() =>{
        setPrimaryOutput(props.outputs[0])
        setSecondaryOutput(props.outputs[1])
    }, [props.outputs])



    return (
    <div>
        <audio ref={primaryAudioRef} src={ props.source } preload="auto"/>
        <audio ref={secondaryAudioRef} src={ props.source } preload="auto"/>
        <button onClick={play} className="pad">{props.name && props.name.slice(0, props.name.indexOf('.mp3'))}</button>

    </div>
    )
}

export default Pad
