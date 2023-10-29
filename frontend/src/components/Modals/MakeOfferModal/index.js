import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import Modal from 'react-bootstrap/Modal';
import { useWallet, useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";
import { toast } from 'react-hot-toast'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

import { METAMASK_CONNECT } from "../../../actions";
import Icons from "../../Global/Icons";
import commonService from "../../../config/services/common.service";
import { signAndSendTransaction } from "../../../config/helpers/sol/connection";
import { MARKETPLACES_API } from "../../../config";

import '../modal.scss'
import './index.scss'


const MakeOfferModal = (props) => {
  const { setLoading, show, onHide, price, address, usdPrice, actualOffer, setActualOffer } = props

  const wallet = useWallet();
  const anchorWallet = useAnchorWallet()
  const { connection } = useConnection();
  const storeData = useSelector(status=>status)
  const dispatch = useDispatch()
  const [offerValue, setOfferValue] = useState()
  const [walletBalance, setWalletBalance] = useState(0)

  const handleOffer = async () => {
    if (!anchorWallet || storeData.metamask === 'connected' || !storeData.metamask ) {
      toast.error(`Please connect your Phantom Wallet`)
      dispatch(METAMASK_CONNECT({
        walletModal : true
      }))
      setLoading(false)
      return
    }

    try {
      if (offerValue < price / 2 || offerValue > price) {
        toast.error(`offvalue must be value between ${price / 2} and ${price}`);
        return
      }

      if (Number(walletBalance) < price / 2) {
        toast.error('insufficient funds');
        return
      }

      if (!offerValue) {
        toast.error(`Input price value exactly`);
        return
      }

      setLoading(true)
      const result = await commonService({
        method: "post",
        route: `${MARKETPLACES_API.GET_MAKEBID_TX}`,
        data: {
          bidderAddress: wallet.publicKey?.toString(),
          mintAddress: address,
          offerPrice: Number(offerValue)
        }
      });

      const transaction = Transaction.from(result.tx.data);
      const res = await signAndSendTransaction(connection, wallet, transaction);
      if (res?.txid) {
        await commonService({
          method: "post",
          route: `${MARKETPLACES_API.GET_MAKEBID_TX_CONF}`,
          data: {
            bidderAddress: wallet.publicKey?.toString(),
            mintAddress: address,
            offerPrice: Number(offerValue),
            signature: res.txid
          }
        });
        toast.success(`successfully offer`)
        if (Number(offerValue) > actualOffer) {
          setActualOffer(Number(offerValue))
        }
        onHide() // The Function is that Modal is hiddened
      }
      else {
        toast.error(`Failed offer`)
      }
      setLoading(false)
    }
    catch (error) {
      console.log(`error`, error);
      toast.error(`Failed offer`)
      setLoading(false)
    }
  }

  useEffect(() => {
    (
      async () => {
        let lamportBalance
        if (wallet?.publicKey) {
          const balance = await connection.getBalance(wallet.publicKey)
          lamportBalance = (balance / LAMPORTS_PER_SOL);
          setWalletBalance(lamportBalance)
        }
      }
    )()

  }, [wallet])

  return (
    <Modal show={show} onHide={onHide} className="marketplace-modal make-offer-modal">
      <Modal.Header closeButton closeVariant='white'>
        <Modal.Title className="text-light">Make an Offer</Modal.Title>

      </Modal.Header>
      <Modal.Body className="offerModal-body" >
        <div className="offerModal-body-top" >

          <p className="offerModal-body-intro" >
            You are about to make an offer for Dodoor #3 from Dodoor NFT collection.
          </p>

          <div className="walletBalance-content" >
            <p className="title" >Wallet Balance</p>
            <div className="walletBalance-layer" >
              <Icons name={42} />
              <p className="price" > {Number(walletBalance).toFixed(2)} SOL</p>
              <p className="usdPrice" >($ {(walletBalance * usdPrice).toFixed(2)} )</p>
            </div>
          </div>

          <div className="yourOffer-content" >
            <p className="title" >Your Offer</p>
            <div className="yourOffer-input" >
              <Icons name={91} />
              <input value={offerValue} onChange={(e) => setOfferValue(e.target.value)} />
            </div>
          </div>
        </div>

        <hr className="offerModal-hr" />

        <div className="offerModal-body-bottom" >
          <div className="footer-content" >
            <div className="footer-layer" >
              <p className="title" >Buy now price</p>
              <p className="price" >{price} SOL</p>
            </div>
            <div className="footer-layer" >
              <p className="title" >Minimum offer (50%)</p>
              <p className="price" >{Number(price / 2)}  SOL</p>
            </div>
            <div className="footer-layer" >
              <p className="title" >Wallet balance</p>
              <p className="price" >{Number(walletBalance).toFixed(2)} SOL</p>
            </div>
            <div className="footer-layer" >
              <p className="title" >Service fee</p>
              <p className="price" >0.01</p>
            </div>
          </div>

          <div className="offer-btn" onClick={handleOffer} >
            Make Offer
          </div>
        </div>


      </Modal.Body>
    </Modal>
  );
}

export default MakeOfferModal;
