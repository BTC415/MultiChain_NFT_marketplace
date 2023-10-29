import {useState, useEffect} from 'react'
import './index.scss'

export default (props)=>{
    const { labelText } = props;
    const [checked, setChecked] = useState(true)
    const clickCehckBox = () => {
        setChecked(!checked)
    }
    return (
        <div className="form-check form-switch mp-check-box">
            <input className="form-check-input" type="checkbox" id="flexSwitchCheckChecked"
                onChange={clickCehckBox} checked={checked}/>
            <label className="form-check-label" for="flexSwitchCheckChecked">{labelText}</label>
        </div>
    )
}