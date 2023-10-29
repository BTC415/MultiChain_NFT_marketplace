import React from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

import Solana from './Solana'
import './modal.scss'
import './index.scss'

const ConnectWalletModal = (props) => {
  const { show, handleClose } = props
  
  return (
    <Modal show={show} onHide={handleClose} className="marketplace-modal connect-wallet-modal">
      <Modal.Header closeButton closeVariant='white'>
        <Modal.Title className="text-light">Connect wallet</Modal.Title>
        
      </Modal.Header>
      <Modal.Body>
        <p className="modal-description">Select the blockchain wallet you want to connect with. There are several wallet providers.</p>
        <div className='cst-tab'>
            <Tabs
                defaultActiveKey="Solana"
                className="mb-3 mt-3"
            >
                <Tab eventKey="Solana" title="Solana">
                  <Solana/>
                </Tab>
                <Tab eventKey="Ethereum" title="Ethereum">
                    
                </Tab>
                <Tab eventKey="Binance BNB" title="Binance BNB">
                    
                </Tab>

            </Tabs>

        </div>
      </Modal.Body>
    </Modal>
  );
}

export default ConnectWalletModal;
