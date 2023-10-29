import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Modal from 'react-bootstrap/Modal';
import { toast } from 'react-hot-toast'
import { ethers, Contract } from "ethers";
import BigNumber from "bignumber.js";
import { METAMASK_CONNECT } from "../../../../actions";

import Icons from "../../../Global/Icons";
import { connectWallet, getBalance } from "../../../../utiles/eth-interact";
import { DECIMAL, MARKETPLACES_ETH_API } from "../../../../config/ether";
import commonService from "../../../../config/services/common.service";
import { MarketPlaceContractAddress } from "../../../../constants/abi";
import MarketplaceAbi from '../../../../constants/abi/Marketplace.json'

import '../../modal.scss'
import './index.scss'


const MakeOfferModal = (props) => {
  const {
    setLoading,
    show,
    onHide,
    price,
    contractAddress,
    tokenId,
    actualOffer,
    setActualOffer } = props
  const storeData = useSelector((state) => state);
  const dispatch = useDispatch()

  const anchorWallet = useAnchorWallet()

  const [offerValue, setOfferValue] = useState()
  const [walletBalance, setWalletBalance] = useState(0)

  const handleOffer = async () => {
    try {
      if (!storeData.metamask || storeData.metamask === 'disconnect') {
        toast.error('Please connect your Metamask Wallet')
        dispatch(METAMASK_CONNECT({
          walletModal: true
        }))
        return
      }

      if (anchorWallet) {
        dispatch(METAMASK_CONNECT({
          walletModal: true
        }))
        toast.error('Please connect your Metamask Wallet')
        return
      }

      const etherWallet = await connectWallet()
      if (offerValue < price / 2 || offerValue > price) {
        toast.error(`offvalue must be value between ${price / 2} and ${price}`);
        return
      }

      if (walletBalance < price / 2) {
        toast.error('insufficient funds');
        return
      }

      if (!offerValue) {
        toast.error(`Input price value exactly`);
        return
      }

      setLoading(true)
      const Provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Provider.getSigner();

      const marketplaceContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)
      const offerPrice = new BigNumber(offerValue).times(new BigNumber(10).pow(new BigNumber(18)))

      const tx = await marketplaceContract.makeOffer(
        contractAddress,
        tokenId,
        offerPrice.toString(),
        {
          value: offerPrice.toString()
        }
      )

      console.log('tx', tx)
      await tx.wait();

      const payload = {
        bidderAddress: etherWallet.address,
        contract: contractAddress,
        id: tokenId,
        offerPrice: offerPrice.toString() / DECIMAL,
        signature: tx.hash
      }

      await commonService({
        method: `post`,
        route: `${MARKETPLACES_ETH_API.MAKE_NFT_OFFER}`,
        data: payload
      })

      toast.success('Successfully Offered')

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
        try {
          const balance = await getBalance();
          setWalletBalance(balance.toFixed(2))
        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

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
            {/* <div className="walletBalance-layer" >
              <Icons name={42} />
              <p className="price" > {Number(walletBalance).toFixed(2)} SOL</p>
              <p className="usdPrice" >($ {(walletBalance * usdPrice).toFixed(2)} )</p>
            </div> */}
          </div>

          <div className="yourOffer-content" >
            <p className="title" >Your Offer</p>
            <div className="yourOffer-input" >
              <Icons name={97} />
              <input value={offerValue} onChange={(e) => setOfferValue(e.target.value)} />
            </div>
          </div>
        </div>

        <hr className="offerModal-hr" />

        <div className="offerModal-body-bottom" >
          <div className="footer-content" >
            <div className="footer-layer" >
              <p className="title" >Buy now price</p>
              <p className="price" >{price} ETH</p>
            </div>
            <div className="footer-layer" >
              <p className="title" >Minimum offer (50%)</p>
              <p className="price" >{Number(price / 2)}  ETH</p>
            </div>
            <div className="footer-layer" >
              <p className="title" >Wallet balance</p>
              <p className="price" >{walletBalance} ETH</p>
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
