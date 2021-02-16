import './App.css';
import React from 'react'
import Controller from './controller'
const { myIpcRenderer } = window






const Menu : React.FunctionComponent = () => {


    const handleClose = () => {
        myIpcRenderer.invoke('APP_close')
    }

    const handleMin = () => {
        myIpcRenderer.invoke('APP_min')
    }

    return(<header>
        <div className="option" onClick={handleClose}>X</div>
        <div className="option" onClick={handleMin}>-</div>
    </header>)
}



const App : React.FunctionComponent = () => {
    

    return(
        <div>
            <Menu/>
            <Controller/>
        </div>
    )
}

export default App;

