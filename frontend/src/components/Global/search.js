import Icons from './Icons';
export default () => {
    return <div className='collection-search'>
        <Icons name={70} />
        <input placeholder='Search a trait in this collection, or the ID' type={"text"} />
    </div>
}