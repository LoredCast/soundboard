import React, {useEffect, useRef, useState} from 'react'
import { ExtendedAudioElement } from './App' 

type padProps = {
    outputs : string[]
    source: string,
    name: string | undefined
}

const Pad : React.FunctionComponent<padProps> = (props : padProps) => {
    const primaryAudioRef = useRef<ExtendedAudioElement>(null) 
    const secondaryAudioRef = useRef<ExtendedAudioElement>(null)
    const [showContext, setShowContext] = useState(false)
    const [contextPos, setContextPos] = useState({})
    
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

    const handleContext = (event : React.MouseEvent<HTMLButtonElement>) => {
        setShowContext(true)
        let x = event.clientX.toString()
        let y = event.clientY.toString()
        setContextPos({
            left: x + 'px',
            top: y + 'px'
        })
        console.log(contextPos)

    }
    const handleMouseOut = (event: React.MouseEvent<HTMLButtonElement>) => {
        if (showContext) setShowContext(false)
    }

    const handleShortcut = () => {

    }
    
    useEffect(() =>{
        setPrimaryOutput(props.outputs[0])
        setSecondaryOutput(props.outputs[1])
    }, [props.outputs])



    return (
    <div>
        <audio ref={primaryAudioRef} src={ props.source } preload="auto"/>
        <audio ref={secondaryAudioRef} src={ props.source } preload="auto"/>
        <button onContextMenu={handleContext}
                onClick={play} 
                className="pad"
                onMouseOut={handleMouseOut}>{props.name && props.name.slice(0, props.name.indexOf('.mp3'))}
        </button>
        {showContext && <div    className="contextMenu" 
                                onClick={handleShortcut}
                                style={contextPos}>
                                Change Hotkey
                        </div>}
    </div>
    )
}

export default Pad
