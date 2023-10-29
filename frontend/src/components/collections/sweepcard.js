import React from 'react';
import { useEffect } from 'react';
import { useState } from 'react';
import Icons from '../Global/Icons';
const Card=({image,title, onClick})=>{
    const [isShown, setIsShown] = React.useState(false);
    
    return <div 
    onClick={onClick}
    onMouseLeave={() => setIsShown(false)}
    onMouseEnter={() => setIsShown(true)}
    className={`sadsaidjw-wje mx-2 ${isShown?"dhaf0je-ew":"kjdsa-awnwwe"}`}>
        <img src={image}/>
        <div className='d-jdsie32'>
            <Icons name={73}/>
        </div>
        <div className='d-flex align-items-center'>
            <Icons name={72}/>
            <h6 className='mx-1 my-2'>{title}</h6>
        </div>
    </div>
}
const Card1=({title,price})=>{
    return <div className='kjdsaf-eokae my-2'>
        <h5>{title}</h5>
        <h6><Icons name={74}/> {price}</h6>
    </div>
}
const Card2=({title,price,price1})=>{
    return <div className='kjdsaf-eokae my-2 dfaj3e0ew'>
        <h5>{title}</h5>
        <div className='d-flex'>
        <h6><Icons name={74}/> {price} - </h6>
        <h6 className='mx-1'> <Icons name={74}/> {price1}</h6>

        </div>
    </div>
}
export default ({sweepList, setSweepList}) => {
    const [avgPrice, setAvgPrice] = useState(0);
    const [lowestPrice, setLowestPrice] = useState(0);
    const [highPrice, setHighPrice] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);

    const removeSweep = (nft) => {
        const newSweepList = sweepList.filter(sweep => sweep.nftId !== nft.nftId);
        setSweepList(newSweepList);
    }

    useEffect(() => {
        if (sweepList.length > 0) {
            let newTotalPrice = 0;
            let newLowestPrice = sweepList[0].price;
            let newHighestPrice = 0;
            sweepList.forEach(sweep => {
                newTotalPrice += sweep.price;
                if (newLowestPrice > sweep.price) newLowestPrice = sweep.price;
                if (newHighestPrice < sweep.price) newHighestPrice = sweep.price;
            });
    
            setTotalPrice(newTotalPrice);
            setAvgPrice(newTotalPrice / sweepList.length);
            setLowestPrice(newLowestPrice);
            setHighPrice(newHighestPrice);
        }
    }, [sweepList]);

    return <div className='asfjs-sfde'>
        <div className='flexBox'>
            <h5>Sweep</h5>
            <button className='btn'>
                <Icons name={71}/>
            </button>
        </div>
        <div className='sadfjhjdskf-sdf'>
            <h5><span>Items:</span> {sweepList.length}</h5>
            <div className='d-flex'>
                {sweepList.map(x => 
                    <Card 
                        title={x.price} 
                        image={x.imageUrl} 
                        onClick={(e) => {
                            e.preventDefault();
                            removeSweep(x);
                        }} />)}
            </div>
           
        </div>
        <div className='my-3 d-flex'>
                <Card1 title={"Avg. NFT"} price={avgPrice}/>
                <Card1 title={"Lowest NFT"} price={lowestPrice}/>
                <Card2 title={"Range"} price={lowestPrice} price1={highPrice}/>
                <div className='flexBox jkfds0-k2qem'>
                    <div>
                        <h4>Total</h4>
                        <div className='flexBox'>
                        <Icons name={74}/>
                        <h3> {totalPrice} <span>($2,312)</span></h3>
                        </div>
                    </div>
                    <div>
                        <button className='btn'>Buy</button>
                    </div>
                </div>
                <button className='btn dasf-sdnre'>
                    <h5>New Floor</h5>
                    <h6>
                        <Icons name={75}/>
                        3.50
                    </h6>
                </button>
        </div>
    </div>
}