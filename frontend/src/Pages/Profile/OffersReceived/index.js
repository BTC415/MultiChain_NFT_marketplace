import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import toast from "react-hot-toast";
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import { ethers, Contract } from "ethers";
import { Transaction } from "@solana/web3.js";
import Table from 'react-bootstrap/Table';

import { METAMASK_CONNECT } from "../../../actions";
import { PROFILE } from '../../../actions'
import Icons from "../../../components/Global/Icons";
import { MARKETPLACES_API } from '../../../config';
import commonService from '../../../config/services/common.service';
import { signAndSendTransaction } from '../../../config/helpers/sol/connection';
import './index.scss'
import { connectWallet } from "../../../utiles/eth-interact";
import { MARKETPLACES_ETH_API, DECIMAL } from "../../../config/ether";
import { MarketPlaceContractAddress } from "../../../constants/abi";
import MarketplaceAbi from '../../../constants/abi/Marketplace.json'

const OffersReceived = () => {
  const wallet = useAnchorWallet();
  const { connection } = useConnection();
  const storeData = useSelector(status=>status)
  const dispatch = useDispatch();

  const [isLoading, setLoading] = useState(false);
  const [offerLists, setOfferLists] = useState([])
  const [offerEtherLists, setOfferEtherLists] = useState([])

  const handleAccept = async (item, index) => {
    try {
      if (!wallet || storeData.metamask === 'connected' || !storeData.metamask ) {
        toast.error(`Please connect your Phantom Wallet`)
        dispatch(METAMASK_CONNECT({
          walletModal : true
        }))
        setLoading(false)
        return
      }

      if (index === 0 || index) {
        setLoading(true)
        const result = await commonService({
          method: "post",
          route: `${MARKETPLACES_API.GET_ACCEPT_TX}`,
          data: {
            bidderAddress: item.walletAddress,
            mintAddress: item.mintAddress,
          }
        });
        const transaction = Transaction.from(result.tx.data);
        const res = await signAndSendTransaction(connection, wallet, transaction);
        if (res?.txid) {

          await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_ACCEPT_TX_CONFT}`,
            data: {
              bidderAddress: item.walletAddress,
              mintAddress: item.mintAddress,
              signature: res.txid
            }
          });

          const remain_nfts = offerLists.filter((list) => list.mintAddress !== item.mintAddress)
          setOfferLists([...remain_nfts])
          dispatch(
            PROFILE({
              mintAddress: item.mintAddress,
              AcceptBidStatus: true
            })
          )

          toast.success('Successfully Accepted')
          setLoading(false)
        }
        else {
          toast.error('Accepting Failed')
          setLoading(false)
        }
        setLoading(false)

      }
    } catch (error) {
      console.log('error', error);
      setLoading(false)
      toast.error('Accepting Failed')
    }

  }

  const handleEtherAccept = async (item, index) => {
    try {
      if(!storeData.metamask ||storeData.metamask === 'disconnect') {
        toast.error('Please connect your Metamask Wallet')
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }

      setLoading(true)
      let _collections = await commonService({
        method: "get",
        route: `${MARKETPLACES_API.GET_COLLECTIONS}`,
      });

      const filter_collection = _collections.rows.find((collection) => {
        return collection.chain === 1 && collection.id === item.collectionId
      })
      if (index === 0 || index) {
        const token_Id = item.nftId

        const Provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = Provider.getSigner();

        const marketplaceContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)

        const tx = await marketplaceContract.acceptOffer(
          filter_collection.contract,
          token_Id,
        )
        console.log('tx', tx)

        await tx.wait()

        const payload = {
          bidderAddress: item.walletAddress,
          contract: filter_collection.contract,
          id: token_Id,
          signature: tx.hash
        }

        await commonService({
          method: `post`,
          route: `${MARKETPLACES_ETH_API.GET_ACCEPT}`,
          data: payload
        })

        const remain_nfts = offerEtherLists.filter((offer) => offer.nftId !== token_Id)
        setOfferEtherLists(remain_nfts)
        toast.success('Successfully Accepted')

      }

      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)

    }
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (!wallet) {
            return;
          }
          setLoading(true)
          let _offersMadeList = await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_RECEIVE_BIDs}`,
            data: {
              walletAddress: wallet?.publicKey?.toBase58(),
              limit: 100,
              currentPage: 1
            }
          });

          let AllMintAddress = [];
          _offersMadeList.rows.map((item) =>
            AllMintAddress.push(item.mintAddress)
          )

          const filterMintAddress = Array.from(new Set(AllMintAddress));

          const result_array = [];
          for (let i = 0; i < filterMintAddress.length; i++) {
            const _highestOffer = await commonService({
              method: "post",
              route: `${MARKETPLACES_API.GET_TOP_BID}`,
              data: {
                mintAddress: filterMintAddress[i],
              }
            });
            result_array.push(_highestOffer)
          }
          setOfferLists([...result_array])
          setLoading(false)
        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()
  }, [wallet])

  useEffect(() => {
    (
      async () => {
        try {
          if(storeData.metamask === 'connected') {
            setLoading(true)
            const etherWallet = await connectWallet()
            let _offersMadeList = await commonService({
              method: "post",
              route: `${MARKETPLACES_ETH_API.RECEIVE_NFT_OFFER}`,
              data: {
                walletAddress: etherWallet.address,
                limit: 100,
                currentPage: 1
              }
            });
            setOfferEtherLists(_offersMadeList.rows)
            setLoading(false)
          } else {
            setOfferEtherLists([])
          }
          

        } catch (error) {
          console.log('error', error)
          setLoading(false)

        }
      }
    )()

  }, [storeData])

  return (
    <>
      {
        isLoading ? <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="offersReceived-profile" >
        <div className="offersReceived-list" >
          <Table className="table-cst" responsive border={0}>
            <thead>
              <tr>
                <th>#</th>
                <th>Collection</th>
                <th>mintAddress</th>
                <th>Buyers</th>
                <th>Offer Price</th>
                <th>Current Price</th>
              </tr>
            </thead>
            {
              wallet ?
                <tbody>
                  {offerLists.length > 0
                    ? offerLists.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{index + 1}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={item.image} alt="img" style={{ width: "60px", height: "60px", borderRadius: "16px" }}
                              onError={(e) => {
                                e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP-3QSHNAEBzr6s2fvf7hhOpnt0HGHthvDoGqFF3XQHg&s"
                              }}
                            />
                            <p className="mx-4">{item.name}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{item.mintAddress}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p className="mx-2">{item.walletAddress}</p>

                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{item.offerPrice}</p>
                            <Icons name={1} />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{item.currentPrice}</p>
                            <Icons name={1} />
                          </div>
                        </td>
                        <td>
                          <button onClick={() => handleAccept(item, index)} >Accept</button>
                        </td>
                      </tr>))
                    : <tr>
                      <td colSpan={10}>
                        <div className='no-nftGroup' >
                          <p className='title' >Nothing Found</p>
                          <p className='subTitle' >We couldn't find anything with this criteria</p>
                        </div>
                      </td>
                    </tr>}
                </tbody>

                :
                <tbody>
                  {offerEtherLists.length > 0
                    ? offerEtherLists.map((item, index) => (
                      <tr key={index}>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{index + 1}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <img src={item.image} alt="img" style={{ width: "60px", height: "60px", borderRadius: "16px" }}
                              onError={(e) => {
                                e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP-3QSHNAEBzr6s2fvf7hhOpnt0HGHthvDoGqFF3XQHg&s"
                              }}
                            />
                            <p className="mx-4">{item.name}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{item.nftId}</p>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p className="mx-2">{item.walletAddress?.substr(0, 6) + '...' + item.walletAddress?.substr(item.walletAddress.length - 4, 4)} </p>

                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{item.offerPrice}</p>
                            <Icons name={97} />
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <p>{item.currentPrice}</p>
                            <Icons name={97} />
                          </div>
                        </td>
                        <td>
                          <button onClick={() => handleEtherAccept(item, index)} >Accept</button>
                        </td>
                      </tr>))
                    : <tr>
                      <td colSpan={10}>
                        <div className='no-nftGroup' >
                          <p className='title' >Nothing Found</p>
                          <p className='subTitle' >We couldn't find anything with this criteria</p>
                        </div>
                      </td>
                    </tr>}
                </tbody>
            }

          </Table>
        </div>
      </div>

    </>
  )
}
export default OffersReceived;