import React, {useEffect, useRef} from 'react'
import { ExtendedAudioElement } from './App' 

type padProps = {
    outputs : string[]
    source: string
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
        primaryAudioRef.current?.play()
        secondaryAudioRef.current?.play()
    }
    
    useEffect(() =>{
        setPrimaryOutput(props.outputs[0])
        setSecondaryOutput(props.outputs[1])
    }, [props.outputs])



    return (
    <div>
        <audio ref={primaryAudioRef} src={ props.source }/>
        <audio ref={secondaryAudioRef} src={ props.source }/>
        <button onClick={play}>{props.source}</button>

    </div>
    )
}

export default Pad
