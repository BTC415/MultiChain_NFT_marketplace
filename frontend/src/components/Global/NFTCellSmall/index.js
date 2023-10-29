import React from 'react';
import Icons from '../Icons';
import NFTImg from '../../../images/2.png'
import SolanaImg from '../../../images/logo/solana-white.png'
import './index.scss'

export default ()=>{
    return <div className="nft-cell-small">
        <img src={NFTImg} className="nft-image"></img>
        <div className="nft-info d-flex">
            <img className="solana-icon" src={SolanaImg}></img>
            <p className="price">80.50</p>
        </div>
    </div>
}