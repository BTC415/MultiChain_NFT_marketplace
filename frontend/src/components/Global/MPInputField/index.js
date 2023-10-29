import './index.scss'

export default (props)=>{
    const { placeHolder, className, onChange, unitText } = props;
    return (
        <div className={`mp-input-field ${className}`}> 
            <input onChange={onChange}></input>
            <p className="unit-text">{unitText}</p>
        </div>
    )
}