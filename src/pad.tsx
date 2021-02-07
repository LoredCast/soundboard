import React, {useEffect, useRef, useState} from 'react'
const { myIpcRenderer } = window

type padProps = {
    outputs : string[]
    source: string,
    name: string | undefined
}

let keys : string[] = []


const Pad : React.FunctionComponent<padProps> = (props : padProps) => {
    const primaryAudioRef = useRef<ExtendedAudioElement>(null) 
    const secondaryAudioRef = useRef<ExtendedAudioElement>(null)
    const [buttonText, setButtonText] = useState<string>()
    const [shortcut, setShortcut] = useState<string>('')
    const [buttonFocus, setButtonFocus] = useState<boolean>(false)
    

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
        
        setButtonFocus(true)
        keys = []
        setButtonText('Recording...')

    }

    const handleKeyDown = (event : React.KeyboardEvent<HTMLButtonElement>) => {
        let keystring : string

        if (buttonFocus) {
            myIpcRenderer.send('APP_unsetkey', shortcut)
            if (keys.length < 2) {
                if (event.key === 'Control'){
                    keys.push('CommandOrControl')
                } if (event.key === 'Escape') {
                    keys = []
                    setButtonText('-')
                    setShortcut('')
                    props.name && localStorage.removeItem(props.name)
                }
                else {
                    keys.push(event.key)
                }
                    
            }
            keystring = keys.join('+')
            keystring && setButtonText(keystring) 
            setShortcut(keystring)

            myIpcRenderer.send('APP_setkey', keystring)
            props.name && localStorage.setItem(props.name, keystring)

            myIpcRenderer.on('APP_PressedHotkey', (args) => {
                if (keystring === args) {
                    play()
                }
            })
        }
    }
    
    const loadHotkey = () => {
        let key : string | null = ''
        if (props.name) key = localStorage.getItem(props.name)
        if (key) {
            myIpcRenderer.send('APP_setkey', key)
            setShortcut(key)
        }
    }

    
    useEffect(() =>{
        loadHotkey()
        setPrimaryOutput(props.outputs[0])
        setSecondaryOutput(props.outputs[1])
        setButtonText(props.name && props.name.slice(0, props.name.indexOf('.mp3')))
    }, [props.outputs, props.name])


    const handleButtonHover = (state: string) => {
        if (state === 'in') {
            setButtonText(shortcut ? shortcut : 'Rightclick to enter hotkey')
            
        }
        if (state === 'out') {
            setButtonText(props.name && props.name.slice(0, props.name.indexOf('.mp3')))
            setButtonFocus(false)
        }


    }


    return (
    <div>
        <audio ref={primaryAudioRef} src={ props.source } preload="auto"/>
        <audio ref={secondaryAudioRef} src={ props.source } preload="auto"/>
        <button onClick={play} 
                className="pad"
                onContextMenu={handleContext}
                onMouseOut={() => handleButtonHover('out')}
                onMouseEnter={() => handleButtonHover('in')}
                onKeyDown={handleKeyDown}>{buttonText}
        </button>
    </div>
    )
}

export default Pad
