import './index.scss'

export default (props)=>{
    const { placeHolder, className, onChange } = props;
    return <input placeHolder={placeHolder} className={`mp-input-field-transparent ${className}`}
        onChange={onChange}></input>
}