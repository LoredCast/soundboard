import { readlink } from 'fs'
import React, { useRef, useState, useEffect } from 'react'
import Pad from './pad'
import Recorder from './Recorder'
const { myIpcRenderer } = window



const Controller : React.FunctionComponent = () => {
    const [paths, setPaths] = useState<string[]>()
    const [padNames, setPadNames] = useState<string[]>()
    const [outputs, setOutputs] = useState<MediaDeviceInfo[]>()
    
    const [selectedPrimaryOutput, setSelectedPrimaryOutput] = useState<string>('default')
    const [selectedSecondaryOutput, setSelectedSecondaryOutput] = useState<string>('default')
    
    const [volume, setVolume] = useState<number>(1.0)
    const [virtualVolume, setVirtualVolume] = useState<number>(1.0)

    const volumeRef = useRef<HTMLInputElement>(null)
    const virtualVolumeRef = useRef<HTMLInputElement>(null)
    
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

        // Load primary and secondary output settings

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

        // Load Pad File Paths and names

        let loaded_paths = localStorage.getItem("paths");
        if (loaded_paths) setPaths(JSON.parse(loaded_paths))

        let loaded_names = localStorage.getItem("names");
        if (loaded_names) setPadNames(JSON.parse(loaded_names))

        // Load Volume Sliders

        let loaded_virtualVolume = localStorage.getItem("virtualVolume")
        if (loaded_virtualVolume) {
            setVirtualVolume(parseFloat(loaded_virtualVolume))
            setSliderStyle(virtualVolumeRef.current!, parseFloat(loaded_virtualVolume))
            virtualVolumeRef.current!.value = (parseFloat(loaded_virtualVolume) * 50).toString() // Scale back to 0 - 50
        }
        

        let loaded_volume = localStorage.getItem("volume")
        if (loaded_volume) {
            setVirtualVolume(parseFloat(loaded_volume))
            setSliderStyle(volumeRef.current!, parseFloat(loaded_volume))
            volumeRef.current!.value = (parseFloat(loaded_volume) * 50).toString() // Scale back to 0 - 50
        }

    
    }

    useEffect(() => {    
        // -------------------------------
        // Primary Entrypoint: Loads all Devices and the directory selection
        // -------------------------------
        let dir = localStorage.getItem('dir')
        if (dir) myIpcRenderer.send('APP_listFiles', dir)

        navigator.mediaDevices.enumerateDevices()
            .then( devices => {
                devices = devices.filter((output) => output.kind === "audiooutput")
                setOutputs(devices)
                loadConfig()
            })
        
        myIpcRenderer.on('APP_listedFiles', (result) => {
           setPaths(result.paths)
           setPadNames(result.fileNames)
           localStorage.setItem("dir", result.dir)
           localStorage.setItem("paths", JSON.stringify(result.paths))
           localStorage.setItem("names", JSON.stringify(result.fileNames))

        })        
    }, [])
    
    const handlePathSelection = () => {
        myIpcRenderer.invoke('APP_showDialog')
    }

    const setSliderStyle = (e: HTMLInputElement, progress : number) => {
        let accent2 = document.documentElement.style.getPropertyValue('--accent2')

        let background = document.documentElement.style.getPropertyValue('--background')



        e.style.background = 'linear-gradient(to right, '+ accent2 + ' 0%, ' + accent2 + ' ' + progress * 100 + '%, ' + background +  ' ' + progress * 100 + '%, ' + background + ' 100%)' // Just CSS Stuff to make the slider work
    }

    const handleVirtualVolumeChange = (e:React.FormEvent<HTMLInputElement>) => {
        let val = parseFloat(e.currentTarget.value)/50  // Scale Input to 0.0 - 1.0
        setVirtualVolume(val)
        localStorage.setItem("virtualVolume", val.toString())
        setSliderStyle(e.currentTarget, val)
    
    }
    
    const handleVolumeChange = (e:React.FormEvent<HTMLInputElement>) => {
        let val = parseFloat(e.currentTarget.value)/50  // Scale Input to 0.0 - 1.0
        setVolume(val)
        
        localStorage.setItem("volume", val.toString())
        setSliderStyle(e.currentTarget, val)
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
                        <input className="slider" type="range" min="0" max="50" onInput={handleVolumeChange} ref={volumeRef}></input>
                    </div>
                    <div>
                        <h2>Virtual Volume</h2>
                        <input className="slider" type="range" min="0" max="50" onInput={handleVirtualVolumeChange} ref={virtualVolumeRef}></input>
                    </div>
                </div>

                <Recorder></Recorder>
            
            
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
