import React from "react";
import Modal from 'react-bootstrap/Modal';
import SolanaImg from '../../../images/logo/solana-white.png'
import MPInputField from '../../../components/Global/MPInputField'
import NFTCellSmall from '../../../components/Global/NFTCellSmall'

import MPSlider from '../../../components/Global/MPSlider'
import MPCheckBox from '../../../components/Global/MPCheckBox'

import '../modal.scss'
import './index.scss'

const AdminCollectionManageModal = (props) => {
  const { show, onHide } = props
  
  return (
    <Modal show={show} onHide={onHide} className="marketplace-modal collection-modal">
      <Modal.Header closeButton closeVariant='white'>
        <Modal.Title className="text-light">Sweep (Gang of D.City)</Modal.Title>
        
      </Modal.Header>
      <Modal.Body>
        <div className="collection-info content-group">
          <div className="max-price-per-item sub-content">
            <p className="content-title">Max price per item (optional)</p>
            <MPInputField unitText="SOL"/>
          </div>
          <div className="number-of-nfts sub-content">
            <p className="content-title">Number of NFTs</p>
            <div className="count-slider-content container-transparent">
              <MPSlider/>
              <MPInputField className="count-input" unitText="items"/>
            </div>
          </div>
          <MPCheckBox labelText="Auto swap items"/>
        </div>
        <div className="items-content content-group">
          <div className="nfts container-gray-back">
            <p className="count-info white-color"><span className="subscription-color">Items: </span>15</p>
            <div className="nft-list">
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
              <NFTCellSmall/>
            </div>
          </div>
          <div className="nft-info">
            <div className="container-gray-back">
              <p className="subscription-color">Avg.NFT</p>
              <div className="info">
                <img src={SolanaImg} className="icon"></img>
                <p className="white-color">80.75</p>
              </div>
            </div>
            <div className="container-gray-back">
              <p className="subscription-color">Lowest NFT</p>
              <div className="info">
                <img src={SolanaImg} className="icon"></img>
                <p className="white-color">50.50</p>
              </div>
            </div>
            <div className="container-gray-back">
              <p className="subscription-color">Range</p>
              <div className="info">
                <img src={SolanaImg} className="icon"></img>
                <p className="white-color">50.50</p>
                <span className="white-color">~</span>
                <img src={SolanaImg} className="icon"></img>
                <p className="white-color">105.85</p>
              </div>
            </div>
          </div>
        </div>
        <div className="crypto-info">
          <div className="buy-content container-transparent">
            <div className="total-price">
              <p className="title white-color">Total</p>
              <div className="price">
                <img src={SolanaImg} className="icon"></img>
                <p className="sky-color">381.56</p>
                <span className="subscription-color">($2,312)</span>
              </div>
            </div>
            <button className="buy-btn possitive-btn">Buy</button>
          </div>
          <div className="container-white-back floor-price">
            <p className="black-color title">New Floor</p>
            <div className="price">
              <img src={SolanaImg} className="icon"></img>
              <p className="black-color">3.50</p>
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AdminCollectionManageModal;
