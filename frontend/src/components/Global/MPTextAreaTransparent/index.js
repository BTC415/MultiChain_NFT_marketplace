import './index.scss'

export default (props)=>{
    const { placeHolder, className, onChange, rowCount } = props;
    return <textarea placeHolder={placeHolder} rows={rowCount} className={`mp-text-area-transparent ${className}`}
        onChange={onChange}></textarea>
}