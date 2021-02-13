import React, { useRef, useState, useEffect } from 'react'
import Pad from './pad'
const { myIpcRenderer } = window


const Controller : React.FunctionComponent = () => {
    const [paths, setPaths] = useState<string[]>()
    const [padNames, setPadNames] = useState<string[]>()
    const [outputs, setOutputs] = useState<MediaDeviceInfo[]>()
    const [selectedPrimaryOutput, setSelectedPrimaryOutput] = useState<string>('default')
    const [selectedSecondaryOutput, setSelectedSecondaryOutput] = useState<string>('default')
    const [volume, setVolume] = useState<number>(1.0)
    const [virtualVolume, setVirtualVolume] = useState<number>(1.0)
    const primaryRef = useRef<HTMLSelectElement>(null)
    const secondaryRef = useRef<HTMLSelectElement>(null)



    const handlePrimaryOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPrimaryOutput(event.currentTarget.value)
        localStorage.setItem('primary_output', event.currentTarget.value)
    }

    const handleSecondaryOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSecondaryOutput(event.currentTarget.value)
        localStorage.setItem('secondary_output', event.currentTarget.value)
    }

    const loadConfig = () => {
        let output_1 = localStorage.getItem('primary_output')
        if (output_1) setSelectedPrimaryOutput(output_1)

        let ref = primaryRef.current!
        var options = Array.from(ref.options)
        
        options.map((option, i) => {
            if (option.value === output_1) {
                option.selected = true
            }
            return 0
        })
        
        let output_2 = localStorage.getItem('secondary_output')
        if (output_2) setSelectedSecondaryOutput(output_2)

        ref = secondaryRef.current!
        options = Array.from(ref.options)
        
        options.map((option, i) => {
            if (option.value === output_2) {
                option.selected = true
            }
            return 0
        })

        let loaded_paths = localStorage.getItem("paths");
        if (loaded_paths) setPaths(JSON.parse(loaded_paths))

        let loaded_names = localStorage.getItem("names");
        if (loaded_names) setPadNames(JSON.parse(loaded_names))
    
    }

    useEffect(() => {    

        navigator.mediaDevices.enumerateDevices()
            .then( devices => {
                devices = devices.filter((output) => output.kind === "audiooutput")
                setOutputs(devices)
                loadConfig()
            })
        
        myIpcRenderer.on('APP_dialogResponse', (result) => {
           setPaths(result.paths)
           setPadNames(result.fileNames)
           localStorage.setItem("paths", JSON.stringify(result.paths))
           localStorage.setItem("names", JSON.stringify(result.fileNames))

        })        
    }, [])
    
    const handlePathSelection = () => {
        myIpcRenderer.invoke('APP_showDialog')
    }

    const handleVirtualVolumeChange = (e:React.FormEvent<HTMLInputElement>) => {
        let val = parseFloat(e.currentTarget.value)/50 
        setVirtualVolume(val)
        e.currentTarget.style.background = 'linear-gradient(to right, #d08770 0%, #d08770 ' + val*100 + '%, #3b4252 ' + val*100 + '%, #3b4252 100%)'
    
    }
    
    const handleVolumeChange = (e:React.FormEvent<HTMLInputElement>) => {
        let val = parseFloat(e.currentTarget.value)/50 
        setVolume(val)
        console.log(val*100)
        e.currentTarget.style.background = 'linear-gradient(to right, #d08770 0%, #d08770 ' + val*100 + '%, #3b4252 ' + val*100 + '%, #3b4252 100%)'

    }
    

    return(
    <div id="controller">   
            <div id="settings">
            <div id="config">
            <button onClick={handlePathSelection}>Select Audio Folder</button>
            
            <div id="outputs">
            <select onChange={ handlePrimaryOutputChange } ref={primaryRef}>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>
            <select onChange={ handleSecondaryOutputChange} ref={secondaryRef}>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>
            </div>
                
            </div>

            <div id="sliderWrapper">
                <div>
                    <h2>Your Volume</h2>
                <input className="slider" type="range" min="0" max="50" onInput={handleVolumeChange} ></input>
                </div>
                <div>
                    <h2>Virtual Volume</h2>
                <input className="slider"type="range" min="0" max="50" onInput={handleVirtualVolumeChange}></input>
                </div>
                </div>
            </div>
            <div id="pads">
            {paths && paths.map((path, index) => 
                <Pad    key={index} 
                        outputs={ [selectedPrimaryOutput, selectedSecondaryOutput] } 
                        source={path} 
                        name={padNames && padNames[index]}
                        volume={volume}
                        virtualVolume={virtualVolume}>
                </Pad>
            )}
            </div>
    </div>
    )
}

export default Controller
