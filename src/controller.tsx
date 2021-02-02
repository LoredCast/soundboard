import React, { useRef, useState, useEffect } from 'react'
import { ExtendedAudioElement } from './App'
import Pad from './pad'
const Controller : React.FunctionComponent = () => {

    const [outputs, setOutputs] = useState<MediaDeviceInfo[]>()
    const [selectedPrimaryOutput, setSelectedPrimaryOutput] = useState<string>('default')
    const [selectedSecondaryOutput, setSelectedSecondaryOutput] = useState<string>('default')
    
    const handlePrimaryOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedPrimaryOutput(event.currentTarget.value)
    }

    const handleSecondaryOutputChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedSecondaryOutput(event.currentTarget.value)
    }

    useEffect(() => {
        navigator.mediaDevices.enumerateDevices()
            .then( devices => {
                devices = devices.filter((output) => output.kind === "audiooutput")
                setOutputs(devices)
            })
    }, [])

    

    return(
    <div> 
            <select onChange={ handlePrimaryOutputChange }>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>
            
            <select onChange={ handleSecondaryOutputChange }>
            {outputs && outputs.map((output, index) => 
                <option key={index} value={ output.deviceId }>{ output.label }</option>  
            )}
            </select>

            <p>Selected Primary: {selectedPrimaryOutput} </p>
        <p>Selected Secondary: { selectedSecondaryOutput } </p>

        <Pad outputs={ [selectedPrimaryOutput, selectedSecondaryOutput] }/>
    </div>
    )
}

export default Controller
