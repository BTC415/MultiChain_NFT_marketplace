import React from 'react';
import Icons from '../Icons';
export default ({value, action})=>{
    return <div className='collection-search'>
        <Icons name={70}/>
        <input value={value} onChange={(e) => action(e.target.value)} placeholder='Search a trait in this collection, or the ID' type={"text"}/>
    </div>
}