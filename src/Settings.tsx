import { ChangeEvent, useEffect, useState } from "react"
const { myIpcRenderer } = window
type props = {
    toggle: any
}

const variables = [
    "--background-dark",
    "--background",
    "--background-light",
    "--background-alpha",
    "--text",
    "--text-darker",
    "--option-bg",
    "--accent1",
    "--accent2",
    "--accent2-dark",
    "--accent2-light",
    "--border"
]


export const Settings : React.FunctionComponent<props> = ({children, toggle}) => {
    

    const [col, setCol] = useState('')

    const setColorVariable = (e: ChangeEvent<HTMLInputElement>) => {
        let name = e.target.name
        let color = e.target.value

        setCol(color)

        document.documentElement.style.setProperty(name, color)
    }

    useEffect(() => {
        myIpcRenderer.send("APP_saveSettings", 'test')
    })

    
    return(
    
    <div className="settings-wrapper">
        <div className="settings-box">
            <div id="settings-header">
                <p onClick={toggle}>x</p>
            </div>

            <div className="theme-selector">

            <h4>ui colors</h4>
            
            {variables.map((name, i) => 
            <div>
                <div className="seperator"></div>
                <div className="color-setting">
                    <label>{name}</label>
                    <input type="color" name={name} onChange={setColorVariable}/>
                </div>
            </div>
            )}

            </div>

        </div>
    </div>)
}