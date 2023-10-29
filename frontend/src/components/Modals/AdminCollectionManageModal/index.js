import React from "react";
import Modal from 'react-bootstrap/Modal';
import NFTImg from '../../../images/2.png'
import '../modal.scss'
import './index.scss'
import ContactCell from './ContactCell'

const AdminCollectionManageModal = (props) => {
  const { show, onHide } = props
  
  return (
    <Modal show={show} onHide={onHide} className="marketplace-modal admin-collection-manage-modal">
      <Modal.Header closeButton closeVariant='white'>
        <Modal.Title className="text-light">PROOF Collective</Modal.Title>
        
      </Modal.Header>
      <Modal.Body>
        <div className="collection-info d-flex justify-content-between">
          <div className="collection-name">
            <p className="content-title">Collection Name</p>
            <p className="content-description">PROOF COLLECTIVE</p>
          </div>
          <div className="collection-name">
            <p className="content-title">NFT Type</p>
            <p className="content-description">Collection</p>
          </div>
        </div>
        <div className="collection-description sub-content">
          <p className="content-title">Collection Description</p>
          <p className="content-description">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Et, volutpat rutrum dolor vitae vel sit fringilla orci nulla. Felis egestas a malesuada magna erat tristique leo, elit sit. Integer commodo varius donec vitae eu, erat. Vitae, consectetur aliquam ipsum, egestas consectetur placerat id laoreet. Cras cras orci at pulvinar ultrices cras. A a viverra adipiscing ullamcorper.</p>
        </div>
        <div className="collection-image sub-content">
          <p className="content-title">Collection Description</p>
          <img src={NFTImg}></img>
        </div>
        <div className="contact-info sub-content">
          <ContactCell tool="instagram" url="t.me/username.com"/>
          <ContactCell tool="instagram" url="t.me/username.com"/>
          <ContactCell tool="instagram" url="t.me/username.com"/>
          <ContactCell tool="instagram" url="t.me/username.com"/>
          <ContactCell tool="instagram" url="t.me/username.com"/>
          <ContactCell tool="instagram" url="t.me/username.com"/>
          <ContactCell tool="instagram" url="t.me/username.com"/>
        </div>
        <div className="nft-hash-content sub-content">
          <p className="content-title">NFT hash</p>
          <p className="content-description">9a8ef1a4ae540fba76900fd02ee41d239f03fbcd857b8e8ce2eaf5e64cb0fd7e</p>
          <p className="content-description">9a8ef1a4ae540fba76900fd02ee41d239f03fbcd857b8e8ce2eaf5e64cb0fd7e</p>
          <p className="content-description">9a8ef1a4ae540fba76900fd02ee41d239f03fbcd857b8e8ce2eaf5e64cb0fd7e</p>
          <p className="content-description">9a8ef1a4ae540fba76900fd02ee41d239f03fbcd857b8e8ce2eaf5e64cb0fd7e</p>
        </div>
        <div className="control-buttons sub-content">
          <button className="approve-btn possitive-btn">Approve</button>
          <button className="decline-btn negative-btn">Decline</button>
        </div>
      </Modal.Body>
    </Modal>
  );
}

export default AdminCollectionManageModal;
