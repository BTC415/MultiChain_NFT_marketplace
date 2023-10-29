import './index.scss'

export default ({ index, title, value }) => {
    return <div key={index} className='attributes-item'>
        <p className="title" >{title}</p>
        <p className="value" >{value}</p>
    </div>
}