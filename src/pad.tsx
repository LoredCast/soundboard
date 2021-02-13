import React, {useEffect, useRef, useState} from 'react'
const { myIpcRenderer } = window

type padProps = {
    outputs : string[]
    source: string,
    name: string | undefined
    key: number
    volume: number
    virtualVolume: number
}

let keys : string[] = []

const Pad : React.FunctionComponent<padProps> = (props : padProps) => {
    const primaryAudioRef = useRef<ExtendedAudioElement>(null) 
    const secondaryAudioRef = useRef<ExtendedAudioElement>(null)
    const [shortcutText, setShortcutText] = useState<string>()
    const [shortcut, setShortcut] = useState<string>('')
    const [buttonFocus, setButtonFocus] = useState<boolean>(false)
    const removeListenerRef = useRef<Function>()

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
        setShortcutText('Recording...')

    }

    const handleKeyDown = (event : React.KeyboardEvent<HTMLButtonElement>) => {
       
        if (buttonFocus && event.key === 'Escape') {
            keys = []
            setShortcut('')
            setShortcutText("")
            props.name && localStorage.removeItem(props.name)
            myIpcRenderer.send('APP_setkey', '', props.name)
            return
        }

        if (buttonFocus && keys.length < 4) {
            keys.push(event.key)
            myIpcRenderer.send('APP_setkey', keys.join('+'), props.name)
     
            setShortcutText(keys.join('+'))
            setShortcut(keys.join('+'))
        }
        
    }
    
    const loadHotkey = () => {
        let key
        if (props.name) key = localStorage.getItem(props.name)
        if (key) {
            setShortcut(key)
            setShortcutText(key)
            myIpcRenderer.send('APP_setkey', key, props.name)
        }

    }

    useEffect(() => {
        loadHotkey()
    }, [props.name]) 
    
    useEffect(() =>{
        setPrimaryOutput(props.outputs[0])
        setSecondaryOutput(props.outputs[1])
    }, [props.outputs, props.name, shortcut])
    
    
    useEffect(() => {
        if (removeListenerRef.current) removeListenerRef.current()
        shortcut && console.log(shortcut)
        removeListenerRef.current = myIpcRenderer.on('APP_keypressed', (args : string) => {
            if(shortcut === args) {
                play()
            }
        })
        props.name && shortcut && localStorage.setItem(props.name, shortcut)
    }, [shortcut, props.name])
    
    useEffect(() => {
       primaryAudioRef.current!.volume = props.volume
       secondaryAudioRef.current!.volume = props.virtualVolume
    }, [props.volume, props.virtualVolume])

    const handleButtonHover = (state: string) => {
        if (state === 'in') {
            setShortcutText('Rightclick to enter hotkey')
            
        }
        if (state === 'out') {
            setShortcutText(shortcut)
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
                onKeyDown={handleKeyDown}>
            {props.name && props.name.slice(0, props.name.indexOf('.mp3'))} <br/>
            {shortcutText}
        </button>
    </div>
    )
}

export default Pad
