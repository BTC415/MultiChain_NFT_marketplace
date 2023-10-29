import { useEffect, useState } from "react";
import { useSelector, useDispatch} from "react-redux";
import { useParams } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import Accordion from 'react-bootstrap/Accordion';

import { useWallet, useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { Transaction, PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { getAssociatedTokenAddress } from "@solana/spl-token";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { METAMASK_CONNECT } from "../../actions";
import { SOLANA_CHAININFO, MARKETPLACES_API } from "../../config";
import Layout from '../../components/Layout';
import Accordian from '../../components/nft/nftAccodrian';
import Accordian1 from '../../components/nft/nftAccodrian1';
import Icons from "../../components/Global/Icons";
import Tabs from '../../components/nft/tabs'
import MakeOfferModal from "../../components/Modals/MakeOfferModal";
import commonService from "../../config/services/common.service";
import { signAndSendTransaction } from "../../config/helpers/sol/connection";
import { getNftMetaDataByMint } from "../../config/helpers/sol/helpers";
import { connectWallet, MarketPlaceContract } from "../../utiles/eth-interact";

import './index.scss'

const NftDetail = () => {
  const { name, address }: any = useParams();
  const wallet: any = useWallet();
  const anchorWallet: any = useAnchorWallet();
  const { connection } = useConnection();

  const dispatch = useDispatch()
  const storeData = useSelector((status:any)=>status)

  const [isLoading, setLoading] = useState(false);

  const [nftInfo, setNftInfo] = useState<any>({});
  const [tokenAddress, setTokenAddress] = useState('')
  const [usdPrice, setUsdPrice] = useState(0);
  const [marketFee, setMarketFee] = useState<any>(0)
  const [seller, setSeller] = useState<any>('');
  const [displayModal, setDisplayModal] = useState(false);
  const [detailStatusType, setDetailStatusType] = useState(``)
  const [actualOffer, setActualOffer] = useState(0)
  const [nftActivity, setNftActivity] = useState<any[]>([])
  const [listPrice, setListPrice] = useState(``)
  const [ownerByAddress, setOwnerByAddress] = useState(``)
  const [royaltiesByAddress, setRoyaltisByAddress] = useState<any>(``)
  const [mintAuthority, setMintAuthority] = useState(``)
  const [nftDescirption, setNftDescription] = useState(``)
  const [getFloorData, setFloorData] = useState<any>()
  const [nftStatus, setNftStatus] = useState({
    list: false,
    buy: false,
    updateList: false,
    information: false
  })

  const chartDataField: any = {
    series: [
      {
        name: 'Floor',
        type: 'area',
        data: getFloorData?.values.map((chart: any) => {
          return chart;
        })
      },
    ],
    options: {
      chart: {
        width: '100% !important',
        height: 350,
        toolbar: {
          show: false,
          offsetX: 0,
          offsetY: 0,
          tools: {
            download: false,
            selection: false,
            zoom: false,
            zoomin: true,
            zoomout: true,
            pan: true,
            reset: true,
            customIcons: []
          },
          export: {
            csv: {
              filename: undefined,
              columnDelimiter: ',',
              headerCategory: 'category',
              headerValue: 'value',
              dateFormatter(timestamp: any) {
                return new Date(timestamp).toDateString()
              }
            },
            svg: {
              filename: undefined,
            },
            png: {
              filename: undefined,
            }
          },
          autoSelected: 'zoom'
        },
      },
      colors: ['#50faf0'],
      fill: {
        type: 'gradient',
        gradient: {
          shade: "light",
          // shadeIntensity: 1,
          opacityFrom: 0.7,
          opacityTo: 0,
          stops: [0, 100]
        }
      },
      stroke: {
        width: 2.5,
        // curve: 'smooth'
      },
      grid: {
        show: false,
        xaxis: {
          lines: {
            show: false
          }
        },
      },
      dataLabels: {
        enabled: false,
      },
      yaxis: [
        {
          labels: {
            style: {
              colors: "#50faf0"
            }
          },
          title: {
            style: {
              color: "#50faf0"
            }
          },
          formatter: function (y: any) {
            return y.toFixed(0);
          },
          // min: yaxisFloor.min,
          // max: yaxisFloor.max,
          tickAmount: 4
        },
      ],
      xaxis: {
        type: 'datetime',
        categories: getFloorData?.timestamps.map((item: any) => item),
        labels: {
          rotate: -20,
          rotateAlways: true,
          style: {
            fontSize: `12px`,
            fontWeight: 700,
            cssClass: 'apexcharts-xaxis-custom',
            color: 'rgb(0, 227, 150)'
          }
        },
        group: {
          style: {
            colors: [`grey`]
          }
        }
      },
      legend: {
        show: true,
        position: 'top',
        horizontalAlign: 'center',
        markers: {
          width: 8,
          height: 8,
          radius: 24
        },
        onItemHover: {
          highlightDataSeries: false
        },
        labels: {
          colors: ['red', 'yellow']
        }
      },
      tooltip: {
        theme: false
      },
      responsive: [{
        breakpoint: 540,
        options: {
          yaxis: {
            show: false
          }
        }
      }],
    },
  }

  const handleMakeList = async () => {
    try {
      if (!anchorWallet || storeData.metamask === 'connected' || !storeData.metamask ) {
        toast.error(`Please connect your Phantom Wallet`)
        dispatch(METAMASK_CONNECT({
          walletModal : true
        }))
        setLoading(false)
        return
      }

      if (listPrice === ``) {
        toast.error(`Input price exactly.`)
        return;
      }

      setLoading(true)

      const result: any = await commonService({
        method: "post",
        route: `${MARKETPLACES_API.GET_MAKELSIT_TX}`,
        data: {
          mintAddress: address,
          price: Number(listPrice)
        }
      });

      if (result?.tx?.data) {
        const transaction = Transaction.from(result.tx.data);
        const res = await signAndSendTransaction(connection, anchorWallet, transaction);

        if (res?.txid) {

          await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_MAKELSIT_TX_CONF}`,
            data: {
              mintAddress: address,
              price: Number(listPrice),
              walletAddress: wallet.publicKey.toString(),
              signature: res.txid
            }
          });

          toast.success('Successfully listed')
          setNftStatus({ ...nftStatus, list: false, updateList: true })

          setLoading(false)
        }

        else {
          toast.error('Listing Failed')
          setLoading(false)
        }
      }

      else {
        toast.error('Listing Failed')
        setLoading(false)
      }

      setLoading(false)

    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error('Listing Failed')
    }

  }

  const handleNftBuy = async () => {
    if (!anchorWallet || storeData.metamask === 'connected' || !storeData.metamask ) {
      toast.error(`Please connect your Phantom Wallet`)
      dispatch(METAMASK_CONNECT({
        walletModal : true
      }))
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const result: any = await commonService({
        method: "post",
        route: `${MARKETPLACES_API.GET_BUY_TX}`,
        data: {
          buyerAddress: wallet.publicKey?.toString(),
          seller: seller,
          mintAddress: address,
        }
      });

      const transaction = Transaction.from(result.tx.data);
      const res = await signAndSendTransaction(connection, wallet, transaction);
      if (res?.txid) {
        await commonService({
          method: "post",
          route: `${MARKETPLACES_API.GET_BUY_TX_CONF}`,
          data: {
            buyerAddress: wallet.publicKey?.toString(),
            mintAddress: address,
            signature: res.txid
          }
        });
        toast.success('Successfully buy')
        setOwnerByAddress(wallet.publicKey.toBase58())
        setNftStatus({ ...nftStatus, buy: false, list: true })
        setLoading(false)
      }
      else {
        toast.error('Buying Failed')
        setLoading(false)
      }
    }
    catch (err) {
      toast.error('Buying Failed')
      setLoading(false)
    }
    setLoading(false)
  }

  const handleUpdateList = async () => {
    try {
      if (!anchorWallet || storeData.metamask === 'connected' || !storeData.metamask ) {
        toast.error(`Please connect your Phantom Wallet`)
        dispatch(METAMASK_CONNECT({
          walletModal : true
        }))
        setLoading(false)
        return
      }
      
      if (listPrice === ``) {
        toast.error(`Input price value exactly`);
        return
      }

      setLoading(true)
      const result: any = await commonService({
        method: "post",
        route: `${MARKETPLACES_API.GET_UPDATE_NFT_TX}`,
        data: {
          mintAddress: address,
          walletAddress: wallet.publicKey?.toString(),
          price: listPrice
        }
      });

      if (result?.tx?.data) {
        const transaction = Transaction.from(result.tx.data);
        try {
          const res = await signAndSendTransaction(connection, anchorWallet, transaction);
          if (res?.txid) {
            await commonService({
              method: "post",
              route: `${MARKETPLACES_API.GET_UPDATE_NFT_TX_CONF}`,
              data: {
                mintAddress: address,
                price: listPrice,
                signature: res.txid
              }
            });
            toast.success("Your NFT price is changed successfully.")
          }
          else {
            toast.error("Updating is failed.")
          }
          setLoading(false)
        }
        catch (err) {
          toast.error("Updating is failed.")
        }
      }

      else {
        toast.error("Updating is failed.")
      }
      setLoading(false);

    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error('Updating is failed.')
    }

  }

  const handleCancelList = async () => {
    try {
      if (!useAnchorWallet) {
        toast.error('Please connect your wallet')
        return
      }
      setLoading(true)
      const result: any = await commonService({
        method: "post",
        route: `${MARKETPLACES_API.GET_UNLIST_NFT_TX}`,
        data: {
          walletAddress: wallet.publicKey?.toString(),
          mintAddress: address
        }
      });
      if (result?.tx?.data) {
        const transaction = Transaction.from(result.tx.data);
        try {
          const res = await signAndSendTransaction(connection, anchorWallet, transaction);
          if (res?.txid) {
            await commonService({
              method: "post",
              route: `${MARKETPLACES_API.GET_UNLIST_NFT_TX_CONF}`,
              data: {
                mintAddress: address,
                signature: res.txid
              }
            });
            toast.success("Successfully canceled.")
            setDetailStatusType('Unlist');
            setNftStatus({ ...nftStatus, updateList: false, list: true })
          }
          else {
            toast.error("Canceling is failed")
          }
        }
        catch (error) {
          console.log(`error`, error);
          toast.error("Canceling is failed")
        }
      }
      else {
        toast.error("Canceling is failed")
      }
      setLoading(false);
    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error('Cancneling error')
    }

  }


  useEffect(() => {
    (
      async () => {
        try {
          if(nftInfo.status === 1) {
            if (nftInfo.status === 1) {

              if (nftInfo.walletAddress === anchorWallet?.publicKey.toBase58()) {
                console.log('updatelist')
                setNftStatus({
                  ...nftStatus,
                  list: false,
                  buy: false,
                  updateList: true,
                  information: false
                })
              } else {
                console.log('buy')
  
                setNftStatus({
                  ...nftStatus,
                  list: false,
                  updateList: false,
                  buy: true,
                  information: false
                })
              }
            } else {
              if (ownerByAddress === anchorWallet?.publicKey.toBase58()) {
                setDetailStatusType('Unlist');
                console.log('list')
                setNftStatus({
                  ...nftStatus,
                  list: true,
                  buy: false,
                  updateList: false,
                  information: false
                })
              } else {
                setDetailStatusType('None');
                console.log('information')
                setNftStatus({
                  ...nftStatus,
                  list: false,
                  buy: false,
                  updateList: false,
                  information: true
                })
              }
            }
          } 
          setSeller(nftInfo.walletAddress)

          if (nftInfo.status === 1) {
            setDetailStatusType('List');
          } else if (nftInfo.status === 2) {
            setDetailStatusType('UnList');

          } else if (nftInfo.status === 3) {
            setDetailStatusType('UpdateList');

          } else if (nftInfo.status === 4) {
            setDetailStatusType('Buy');

          } else if (nftInfo.status === 5) {
            setDetailStatusType('MakeOffer');

          } else if (nftInfo.status === 6) {
            setDetailStatusType('UpdateOffer');

          } else if (nftInfo.status === 7) {
            setDetailStatusType('CancelOffer');

          } else if (nftInfo.status === 8) {
            setDetailStatusType('AcceptOffer');
          }

        } catch (error) {
          console.log('error', error)
        }
      }
    )();
  }, [anchorWallet,nftInfo, ownerByAddress ]);

  useEffect(() => {
    (
      async () => {
        try {
          // if (!wallet.publicKey) {
          //   toast.error('Please connect your wallet');
          //   return;
          // }

          const get_usdPrice: any = await commonService({
            method: 'get',
            route: `${SOLANA_CHAININFO}`
          })
          setUsdPrice(get_usdPrice.priceUsdt);

          let feeInfo: any = await commonService({
            method: "get",
            route: `${MARKETPLACES_API.GET_SETTING}MARKETPLACE_FEE`,
          });
          setMarketFee(feeInfo?.value)

          let listItemResult: any = await commonService({
            method: "get",
            route: `${MARKETPLACES_API.GET_LIST_ITEM}${address}`,
          });

          const largestAccounts = await connection.getTokenLargestAccounts(
            new PublicKey(address)
          );

          const largestAccountInfo: any = await connection.getParsedAccountInfo(
            largestAccounts.value[0].address
          )

          const ownerWallet = largestAccountInfo.value.data.parsed.info.owner
          setOwnerByAddress(ownerWallet)

          const getMetadata: any = await getNftMetaDataByMint(address);
          setMintAuthority(getMetadata?.updateAuthority)
          setNftDescription(getMetadata?.description)

          const token_address = await getAssociatedTokenAddress(new PublicKey(address), new PublicKey(address), true);

          if (!listItemResult.data) {
            setTokenAddress(token_address.toBase58())
            setRoyaltisByAddress(getMetadata?.seller_fee_basis_points / 100)
            setNftInfo(getMetadata)
          }

          if (listItemResult.status) {
            setNftInfo(listItemResult)

            const token_address = await getAssociatedTokenAddress(new PublicKey(listItemResult?.mintAddress), new PublicKey(listItemResult?.walletAddress), true);
            setTokenAddress(token_address.toBase58())
          }

          let getActivityByNft: any = await commonService({
            method: `POST`,
            route: MARKETPLACES_API.GET_ACTIVITY_NFT,
            data: {
              mintAddress: address,
              limit: 100,
              currentPage: 1
            }
          })

          setNftActivity([getActivityByNft.rows])

          const get_acutal_offer: any = await commonService({
            method: `post`,
            route: `${MARKETPLACES_API.GET_OFFER_ITEM}`,
            data: {
              mintAddress: address,
              limit: 100,
              currentPage: 1
            }
          })
          if (get_acutal_offer.rows.length > 0) {
            const new_offerPrice = Math.max(...get_acutal_offer.rows.map((item: any) => item.offerPrice))
            setActualOffer(new_offerPrice)
          }

          const getChartData = await commonService({
            method: `get`,
            route: `${MARKETPLACES_API.GET_LIST_ITEM}${address}/salegraph`
          })

          setFloorData(getChartData)

          await commonService({
            method: "get",
            route: `${MARKETPLACES_API.GET_LIST_ITEM}${address}`,
          });

        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  return (
    <Layout>
      {
        isLoading ? <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }
      <div className="nft-layout">
        <Link to={`/collection/solana/${name}`} style={{ textDecoration: `none` }} className='back-btn' >
          <button className="back-arrow"   >
            <Icons name={32} />
            <h4>Back</h4>
          </button>
        </Link>
        <div className="collection-nft-layout-control ">
          <div className="nft-detail-content" >
            <div className="nft-detail-left" >
              <div className="pos-rel" >

                {
                  !nftInfo?.image ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                    <p style={{ width: `100%` }} >
                      <Skeleton count={1} style={{ minHeight: `500px` }} />
                    </p>
                  </SkeletonTheme>
                    :
                    <img src={nftInfo?.image} style={{
                      width: `100%`, minHeight: `500px`
                    }} alt="NFT"
                      onError={(e) => {
                        e.currentTarget.src = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP-3QSHNAEBzr6s2fvf7hhOpnt0HGHthvDoGqFF3XQHg&s"
                      }}
                    />

                }

                <div className="pos-nft-ab">
                  <button className="back-arrow px-2 py-1 mx-113">
                    <Icons name={33} />
                    <h4>{nftInfo?.favouriteCount}</h4>
                  </button>
                  <button className="back-arrow px-2 py-1 mx-113">
                    <Icons name={34} />
                    <h4>PFP</h4>
                  </button>
                </div>
              </div>
              <div className="mt-3">
                <Tabs nftInfo={nftInfo} nftActivity={nftActivity} />
              </div>
            </div>

            <div className="nft-detail-right" >
              <div className="watching-group" >
                <Icons name={35} />
                <p><span>X degens</span> are watching this NFT right now </p>
              </div>

              <div className="name-view-group" >
                <div className="name-group" >
                  <p> PROOF_XYZ</p>
                  <div className="name-content" >
                    <h3>{nftInfo?.name}</h3>
                    <div className="msg-item" >
                      <Icons name={89} />
                    </div>
                  </div>
                </div>
                <div className="view-group" >
                  <div className="view-item" >
                    <Icons name={36} />
                    <p>2k views</p>
                  </div>
                  <div className="view-item" >
                    <Icons name={37} />
                    <p>321</p>
                  </div>
                  <div className="view-item" >
                    <Icons name={38} />
                    <p>Share</p>
                  </div>
                  <div className="view-item" >
                    <Icons name={39} />
                    <p>Refresh</p>
                  </div>
                </div>
              </div>

              <div className="contact-group" >
                <div className="contact-top" >
                  <div className="contact-item" >
                    <Icons name={40} />
                    <div className="contact-layer" >
                      <p className="title" >Created by</p>
                      {
                        !mintAuthority ?
                          <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <p style={{ width: `100% ` }} >
                              <Skeleton count={1} />
                            </p>
                          </SkeletonTheme>
                          :
                          <p className="value" > {mintAuthority?.substr(0, 6) + '...' + mintAuthority?.substr(mintAuthority.length - 4, 4)} </p>

                      }
                    </div>

                  </div>

                  <div className="contact-item" >
                    <Icons name={40} />
                    <div className="contact-layer" >
                      <p className="title" >Contact the Owner</p>
                      {
                        !ownerByAddress ?
                          <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <p style={{ width: `100% ` }} >
                              <Skeleton count={1} />
                            </p>
                          </SkeletonTheme>
                          :
                          nftInfo?.status !== 1 ?
                            <p className="value" >
                              {ownerByAddress?.substr(0, 6) + '...' + ownerByAddress?.substr(ownerByAddress.length - 4, 4)}
                            </p>
                            :
                            !nftInfo?.walletAddress ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                              <p style={{ width: `50px` }} >
                                <Skeleton count={1} />
                              </p>
                            </SkeletonTheme> :
                              <p className="value" >
                                {nftInfo?.walletAddress?.substr(0, 6) + '...' + nftInfo?.walletAddress?.substr(nftInfo?.walletAddress.length - 4, 4)}
                              </p>
                      }

                    </div>

                  </div>
                </div>

                <div className="contact-bottom" >
                  <div> <Icons name={41} /></div>
                  <h4 className="title" >Contact the Owner</h4>
                </div>
              </div>

              {
                !nftStatus ?
                  <div className="list-group" >
                    <SkeletonTheme baseColor="#202020" highlightColor="#444">
                      <p style={{ width: `50px` }} >
                        <Skeleton count={1} style={{ height: `60px` }} />
                      </p>
                    </SkeletonTheme>
                  </div>

                  :
                  <div className="list-group buy-group" >
                    {
                      nftStatus.list && <>
                        <div className="list-top" >
                          <Icons name={90} />
                          <p>Not Listed</p>
                        </div>
                        <div className="list-bottom" >
                          <p className="title" >List Price</p>
                          <div className="list-bottom-control" >
                            <div className="price-input-group" >
                              <Icons name={91} />
                              <input
                                type={`number`}
                                inputMode={`numeric`}
                                value={listPrice}
                                onChange={(e) => setListPrice(e.target.value)}
                                className="price-input"
                              />
                            </div>
                            <button className="list-btn" onClick={handleMakeList} >
                              List Now
                            </button>
                          </div>
                          <p className="terms" >By listing this item, you agree to our <span>Terms and Services</span></p>
                        </div>
                      </>
                    }

                    {
                      nftStatus.buy && <>
                        <div className="buy-top" >
                          <div className="buy-item" >
                            <p className="title" >Current price</p>
                            <div className="price-layer" >
                              <Icons name={42} />
                              {
                                !nftInfo.price ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p style={{ width: `50px` }} >
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme>
                                  :
                                  <span className="sol-price" >{nftInfo.price} SOL</span>
                              }

                              {
                                !nftInfo.price ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p style={{ width: `50px` }} >
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme>
                                  :
                                  <span className="sol-usdPrice" >( $ {Number(nftInfo.price * usdPrice).toFixed(2)}  )</span>

                              }
                            </div>
                          </div>

                          <div className="buy-item" >
                            <p className="title" >Actual Offer</p>
                            <div className="price-layer" >
                              <Icons name={42} />
                              {
                                actualOffer < 0 ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p style={{ width: `50px` }} >
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme>
                                  :
                                  <span className="sol-price"  >{actualOffer} SOL</span>
                              }

                              {
                                actualOffer < 0 ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p style={{ width: `50px` }} >
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme>
                                  :
                                  <span className="sol-usdPrice" >( $ {Number(actualOffer * usdPrice).toFixed(2)}    )</span>

                              }

                            </div>
                          </div>
                        </div>
                        <div className="buy-bottom" >
                          <button className={`  buy-btn`} onClick={handleNftBuy} >
                            Buy Now
                          </button>
                          <button className="make-offer" style={{ cursor: `pointer` }} onClick={() => setDisplayModal(true)} >
                            Make Offer
                          </button>

                        </div>
                      </>
                    }

                    {
                      nftStatus.updateList && <>
                        <div className="update-top" >
                          <Icons name={93} />
                          <p>Listed</p>
                        </div>
                        <div className="update-bottom" >
                          <p className="title" >List Price</p>
                          <div className="update-bottom-control" >
                            <div className="price-input-group" >
                              <Icons name={91} />
                              <input
                                value={listPrice}
                                onChange={(e) => setListPrice(e.target.value)}
                                className="price-input"
                              />
                            </div>
                            <div className="update-delist-group" >

                              <button className="update-btn" onClick={handleUpdateList} >
                                Update Now
                              </button>
                              <button className="delist-btn" onClick={handleCancelList}  >Delist</button>
                            </div>
                          </div>
                          <p className="terms" >By listing this item, you agree to our <span>Terms and Services</span></p>
                        </div>
                      </>
                    }

                    {
                      nftStatus.information && <></>
                    }

                    <div className="about-group" >
                      <Accordian nftInfo={nftInfo} nftDescirption={nftDescirption} />
                    </div>

                    <div className="detail-group" >
                      <Accordian1
                        nftInfo={nftInfo}
                        tokenAddress={tokenAddress}
                        detailStatusType={detailStatusType}
                        marketFee={marketFee}
                        royaltiesAddress={nftInfo.status === 1 ? nftInfo.sellerFeeBasisPoints / 100 : royaltiesByAddress}
                        mintAddress={nftInfo.status === 1 ? nftInfo.mintAddress : address}
                        ownerAddress={nftInfo.status === 1 ? nftInfo?.walletAddress : ownerByAddress}
                      />
                    </div>
                  </div>
              }
            </div>
          </div >

          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>
                <div className='flexBox w-100' >
                  <div className='flexBox'>
                    <Icons name={96} />
                    <h5 className='mx-3'>Price History</h5>
                  </div>
                  <Icons name={44} />

                </div>
              </Accordion.Header>
              <Accordion.Body>
                {
                  isLoading ?
                    <SkeletonTheme baseColor="#202020" highlightColor="#444">
                      <p style={{ width: `100%` }} >
                        <Skeleton count={1} style={{ minHeight: `300px` }} />
                      </p>
                    </SkeletonTheme>
                    :
                    <ReactApexChart
                      options={chartDataField.options}
                      series={chartDataField.series}
                      type="area"
                      width={`100%`}
                      height={330}
                    />
                }
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>


          <MakeOfferModal
            setLoading={setLoading}
            show={displayModal}
            onHide={() => setDisplayModal(false)}
            price={nftInfo.price}
            address={address}
            usdPrice={usdPrice}
            actualOffer={actualOffer}
            setActualOffer={setActualOffer}
          />
        </div >
      </div >
    </Layout >
  );
}

export default NftDetail;
