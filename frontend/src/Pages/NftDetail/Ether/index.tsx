import { useEffect, useState } from "react";
import { useSelector,useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import Accordion from 'react-bootstrap/Accordion';
import { ethers, Contract } from "ethers";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import BigNumber from "bignumber.js";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";

import { METAMASK_CONNECT } from "../../../actions";
import Layout from '../../../components/Layout';
import Icons from "../../../components/Global/Icons";
import Tabs from '../../../components/nft/ether/tabs'
import { MARKETPLACES_ETH_API,DECIMAL } from "../../../config/ether";
import MakeOfferModal from "../../../components/Modals/Ethereum/MakeOfferModal";
import commonService from "../../../config/services/common.service";
import { connectWallet, MarketPlaceContract } from "../../../utiles/eth-interact";
import ERC721TokenAbi from '../../../constants/abi/ERC721.json'
import ERC1155TokenAbi from '../../../constants/abi/ERC1155.json'
import MarketplaceAbi from '../../../constants/abi/Marketplace.json'

import './index.scss'
import { MarketPlaceContractAddress } from "../../../constants/abi";
import NftAboutAccordion from "../../../components/nft/ether/nftAboutAccordion";
import NftDetailAccordion from "../../../components/nft/ether/nftDetailAccordion";

import { MarketPlaceErc1155SaleContractAddress } from "../../../constants/abi";
import MarketPlaceErc1155SaleAbi from '../../../constants/abi/MarketplaceERC1155Sale.json'

declare global {
  interface Window {
    ethereum?: any;
  }
}

const NftEtherDetail = () => {
  const { contractAddress, tokenId }: any = useParams();
  const storeData = useSelector((state: any) => state);
  const dispatch = useDispatch()
  const wallet = useWallet()
  const anchorWallet = useAnchorWallet()

  const [isLoading, setLoading] = useState(false);

  const [nftInfo, setNftInfo] = useState<any>({});
  const [collectionInfo, setCollectionInfo] = useState<any>({});

  const [nftAmount, setnftAmount ] = useState(1)
  const [nftActivity, setNftActivity] = useState<any[]>([])
  const [listPrice, setListPrice] = useState<any>(``)
  const [getFloorData, setFloorData] = useState<any>()
  const [displayModal, setDisplayModal] = useState(false);

  const [etherWallet, setEtherWallet] = useState(``)
   const [nftStatus, setNftStatus] = useState({
    list: false,
    buy: false,
    updateList: false,
    information: false
  })

  const [nftStatusSkeleton, setNftStatusSkeleton ] = useState(false)

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
      if(storeData.metamask === 'disconnect') {
        MetamaskConnectToast()
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }
      if(anchorWallet) {
        MetamaskConnectToast()
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }
      if (!etherWallet) {
        toast.error('Please connect your wallet');
        return
      }

      if (listPrice === ``) {
        toast.error(`Input price value exactly`);
        return
      }

      setLoading(true)

      if(nftInfo?.contract_type === 'ERC1155') {

        const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
        const signer = Provider.getSigner();
        const TokenContract = new Contract(contractAddress, ERC1155TokenAbi, signer)
        console.log('TokenContract',TokenContract)
        const apporveTx = await TokenContract.setApprovalForAll(MarketPlaceErc1155SaleContractAddress, true);
        await apporveTx.wait();
        const marketplaceContract = new Contract(MarketPlaceErc1155SaleContractAddress, MarketPlaceErc1155SaleAbi.abi, signer)
        console.log('marketplaceContract',marketplaceContract)

        const startPrice:any = new BigNumber(listPrice).times(new BigNumber(10).pow(new BigNumber(18)))
        const endPrice =   new BigNumber(listPrice).times(new BigNumber(10).pow(new BigNumber(18)))
        const amount =   new BigNumber(nftAmount)
        const startedAt = Math.floor( Date.now()/ 1000)
        console.log(startPrice.toString())
        const components = {
          payment : 0,
          seller:etherWallet,
          startPrice: startPrice.toString(),
          endPrice: endPrice.toString(),
          amount : amount.toString(),
          startedAt : startedAt,
          duration : 0,
          offerers : [],
          offerPrices:[],
          offerAmounts:[]
        }

        const tx = await marketplaceContract.createSale(
          contractAddress,
          tokenId,
          components,
        )
        console.log('tx', tx)
  
        await tx.wait()
         
        const payload = {
          contract: contractAddress,
          id: tokenId,
          price: startPrice.toString() / DECIMAL,
          wallet: etherWallet,
          signature: tx.hash
        }
  
         await commonService({
          method: `post`,
          route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/list`,
          data: payload
        })  

      } else {
        const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
        const signer = Provider.getSigner();
        const TokenContract = new Contract(contractAddress, ERC721TokenAbi, signer)
  
        const apporveTx = await TokenContract.approve(MarketPlaceContractAddress, tokenId);
        await apporveTx.wait();
  
        const marketplaceContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)
  
        const payment = 0
        const startPrice:any = new BigNumber(listPrice).times(new BigNumber(10).pow(new BigNumber(18)))
        const endPrice =   new BigNumber(listPrice).times(new BigNumber(10).pow(new BigNumber(18)))
  
        const tx = await marketplaceContract.createSale(
          contractAddress,
          tokenId,
          payment,
          startPrice.toString(),
          endPrice.toString(),
          0,
        )
        console.log('tx', tx)
  
        await tx.wait()
         
        const payload = {
          contract: contractAddress,
          id: tokenId,
          price: startPrice.toString() / DECIMAL,
          wallet: etherWallet,
          signature: tx.hash
        }
  
         await commonService({
          method: `post`,
          route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/list`,
          data: payload
        })  
      }

      setNftStatus({
          ...nftStatus,
          list: false,
          buy: false,
          updateList: true,
          information: false
      })

      toast.success(`Successfully Listed`)
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error('Listing Failed')
    }

  }

  const handleUpdateList = async() => {
     try {
       if(!storeData.metamask ||storeData.metamask === 'disconnect') {
        MetamaskConnectToast()
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }
      
      if(anchorWallet) {
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        MetamaskConnectToast()
        return
      }
     
      if (!etherWallet) {
        toast.error('Please connect your wallet');
        return
      }

      if (listPrice === ``) {
        toast.error(`Input price value exactly`);
        return
      }
      setLoading(true)

      const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Provider.getSigner();

      const marketplaceContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)

      const payment = 0
      const startPrice :any= new BigNumber(listPrice).times(new BigNumber(10).pow(new BigNumber(18)))
      const endPrice = new BigNumber(listPrice).times(new BigNumber(10).pow(new BigNumber(18)))

      const tx = await marketplaceContract.updateSale(
        contractAddress,
        tokenId,
        payment,
        startPrice.toString(),
        endPrice.toString(),
        0,
      )
      console.log('tx', tx)

      await tx.wait()
       
      const payload = {
        contract: contractAddress,
        id: tokenId,
        price: startPrice.toString() / DECIMAL,
        wallet: etherWallet,
        signature: tx.hash
      }

       await commonService({
        method: `post`,
        route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/update`,
        data: payload
      })

      toast.success(`Successfully Updated`)
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
      toast.error('Updating Failed')
    }
  }
    
  const handleCancelList = async () => {
    try {
      if(storeData.metamask === 'disconnect') {
        MetamaskConnectToast()
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }
      if(anchorWallet) {
        MetamaskConnectToast()
          dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }
      setLoading(true)
      const contract = await MarketPlaceContract()
      const token_Id = tokenId

      const tx = await contract.cancelSale(
        contractAddress,
        token_Id,
      )
      console.log('tx', tx)

      await tx.wait()

      const payload = {
        contract: contractAddress,
        id: tokenId,
        wallet: etherWallet,
        signature: tx.hash
      }

        await commonService({
          method: `post`,
          route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/unlist`,
          data: payload
        })

        setNftStatus({
          ...nftStatus,
          list: true,
          buy: false,
          updateList: false,
          information: false
        })
        toast.success(`Successfully unlisted`);
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  const handleNftBuy = async () => {
    try {
      if(!storeData.metamask ||storeData.metamask === 'disconnect') {
        MetamaskConnectToast()
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        return
      }
      
      if(anchorWallet) {
        dispatch(METAMASK_CONNECT({
          walletModal:true
        }))
        MetamaskConnectToast()
        return
      }
     
      setLoading(true)
     
      const Provider: any = new ethers.providers.Web3Provider(window.ethereum);
      const signer = Provider.getSigner();

      const marketplaceContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)
      const token_Id = tokenId
      
      const price = new BigNumber(nftInfo.price).times(new BigNumber(10).pow(new BigNumber(18)))

      const tx = await marketplaceContract.buy(
        contractAddress,
        token_Id,
        {
          value :price.toString()
        }
      )
      console.log('tx', tx)
    
      await tx.wait()

      const payload = {
        buyerAddress: etherWallet,
        contract: contractAddress,
        id: tokenId,
        signature: tx.hash
      }

      console.log('payload',payload)

      await commonService({
        method: `post`,
        route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/buy`,
        data: payload
      })


      setNftStatus({
        ...nftStatus,
        list: true,
        buy: false,
        updateList: false,
        information: false
      })
      toast.success(`Successfully buyed`)
      setLoading(false)
    } catch (error) {
      console.log('error', error)
      setLoading(false)
    }
  }

  const handleNftIncrease = () => {
    if(nftAmount< Number(nftInfo.amount) ) {
      setnftAmount(nftAmount+1)
    }
  }

  const handleNftDecrease = () => {
    if(nftAmount>1 ) {
      setnftAmount(nftAmount-1)
    }
  }

  const MetamaskConnectToast = ()=> {
    toast.error('Please connect your Metamask Wallet')
    return;
  }

  useEffect(() => {
    (
      async () => {
        try {
          setNftStatusSkeleton(true)
          if (storeData.metamask === 'connected' ) {
            const status_nft = nftInfo?.nft?.status ? nftInfo?.nft?.status : nftInfo.status
            const ownerWalletAddress = nftInfo?.nft?.owner_of? nftInfo?.nft?.owner_of : nftInfo?.owner_of

            const nftWalletAddress = nftInfo?.nft?.walletAddress ?  nftInfo?.nft?.walletAddress  : nftInfo?.owner_of
            if (status_nft === 1) {
              if (nftWalletAddress === etherWallet) {
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
              console.log('no list')
                if (ownerWalletAddress === etherWallet) {
                console.log('list')
                setNftStatus({
                  ...nftStatus,
                  list: true,
                  buy: false,
                  updateList: false,
                  information: false
                })
  
              } else {
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
          } else {
            setNftStatus({
              ...nftStatus,
              list: false,
              updateList: false,
              buy: true,
              information: false
            })
          }
          setNftStatusSkeleton(false)

        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [etherWallet, nftInfo,storeData ])

  useEffect(() => {
    (
      async () => {
        const ether_Wallet = await connectWallet();
        setEtherWallet(ether_Wallet.address)
        const get_nftInfo: any = await commonService({
          method: `get`,
          route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/${contractAddress}/${tokenId}`
        })
        console.log('get_nftInfo',get_nftInfo)
        const ipfs = JSON.parse(get_nftInfo?.metadata).image
        let get_image = ''
        if (ipfs.includes('ipfs://')) {
          get_image = 'https://ipfs.io/ipfs/' + ipfs.replace('ipfs://', '')
        } else {
          get_image = ipfs
        }

        setNftInfo({
          ...get_nftInfo.nft,
          image : get_nftInfo?.nft?.image ? get_nftInfo?.nft?.image : get_image,
          minter_address : get_nftInfo?.minter_address ? get_nftInfo?.minter_address  :``,
          attributes : get_nftInfo?.nft?.attributes ? get_nftInfo?.nft?.attributes : JSON.parse(get_nftInfo?.metadata)?.attributes,
          owner_of : get_nftInfo?.nft?.walletAddress ? get_nftInfo?.nft?.walletAddress :  get_nftInfo?.owner_of,
          contract_type : get_nftInfo?.contract_type,
          amount : get_nftInfo?.amount
        })
        // setNftInfo(get_nftInfo.nft)
        const collection_info = await commonService({
          method: 'get',
          route: `${MARKETPLACES_ETH_API.GET_COLLECTION}/${contractAddress} `
        })
        
        setCollectionInfo(collection_info)
        
         let getActivityByNft: any = await commonService({
          method: `POST`,
          route:MARKETPLACES_ETH_API.GET_ACTIVITY_NFT,
          data: {
            contract: contractAddress,
            id : tokenId,
            limit: 100,
            currentPage: 1
          }
        })  

        setNftActivity([getActivityByNft.rows])

        const getChartData = await commonService({
          method: `get`,
          route: `${MARKETPLACES_ETH_API.GET_NFT_ITEM}/${contractAddress}/${tokenId}/salegraph`
        })
        setFloorData(getChartData)

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
        <Link to={`/collection/ether/${contractAddress}`} style={{ textDecoration: `none` }} className='back-btn' >
          <button className="back-arrow"   >
            <Icons name={32} />
            <h4>Back</h4>
          </button>
        </Link>
        {/* <button onClick={handleListTwo} >erc1155 list</button> */}
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
                        !nftInfo?.minter_address ?
                          <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <p style={{ width: `100% ` }} >
                              <Skeleton count={1} />
                            </p>
                          </SkeletonTheme>
                          :
                          <p className="value" > {nftInfo?.minter_address?.substr(0, 6) + '...' + nftInfo?.minter_address?.substr(nftInfo?.minter_address.length - 4, 4)} </p>

                      }
                    </div>

                  </div>

                  <div className="contact-item" >
                    <Icons name={40} />
                    <div className="contact-layer" >
                      <p className="title" >Contact the Owner</p>
                      {
                        !nftInfo?.owner_of ?
                          <SkeletonTheme baseColor="#202020" highlightColor="#444">
                            <p style={{ width: `100% ` }} >
                              <Skeleton count={1} />
                            </p>
                          </SkeletonTheme>
                          :
                          <p className="value" >
                            {nftInfo?.owner_of?.substr(0, 6) + '...' + nftInfo?.owner_of?.substr(nftInfo?.owner_of.length - 4, 4)}
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
                nftStatusSkeleton ?
                  <div className="list-group" >
                    <SkeletonTheme baseColor="#202020" highlightColor="#444">
                      <p style={{ width: `100%` }} >
                        <Skeleton count={1} style={{ height: `60px` }} />
                      </p>
                    </SkeletonTheme>
                  </div>

                  :
                  <div className="list-group buy-group" >
                    {
                      nftStatus.list &&
                      <>
                        <div className="list-top" >
                          <Icons name={90} />
                          <p>Not Listed</p>
                        </div>
                        <div className="list-bottom" >
                          <div className="title-group" >
                            <p className="title" >List Price</p>
                            <div className="nft-count" >
                              <div className="nft-decrease" onClick={handleNftDecrease} >-</div>
                              <div className="nft-amount" >{nftAmount}</div>
                              <div className="nft-increase" onClick={handleNftIncrease}  >+</div>
                            </div>
                          </div>
                          <div className="list-bottom-control" >
                            <div className="price-input-group" >
                              <Icons name={97} />
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
                      nftStatus.buy&&
                      <>
                      <div className="buy-top" >
                        <div className="buy-item" >
                          <p className="title" >Current price</p>
                          <div className="price-layer" >
                            {nftInfo?.price &&  <Icons name={42} />} 
                            {
                              nftStatusSkeleton ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                <p style={{ width: `50px` }} >
                                  <Skeleton count={1} />
                                </p>
                              </SkeletonTheme>
                                : nftInfo?.price?
                                <span className="sol-price" >{nftInfo?.price} ETH</span>
                                :<></>
                            }

                            {/* {
                              !nftInfo.price ? <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                <p style={{ width: `50px` }} >
                                  <Skeleton count={1} />
                                </p>
                              </SkeletonTheme>
                                :
                                <span className="sol-usdPrice" >( $ {Number(nftInfo.price * usdPrice).toFixed(2)}  )</span>

                            } */}
                          </div>
                        </div>

                        <div className="buy-item" >
                          {/* <p className="title" >Actual Offer</p> */}
                          {/* <div className="price-layer" >
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

                          </div> */}
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
                      nftStatus.updateList &&<>
                        <div className="update-top" >
                          <Icons name={93} />
                          <p>Listed</p>
                        </div>
                        <div className="update-bottom" >
                          <p className="title" >List Price</p>
                          <div className="update-bottom-control" >
                            <div className="price-input-group" >
                              <Icons name={97} />
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
                  </div>
                }

                <div className="about-group" >
                <NftAboutAccordion
                  nftInfo={nftInfo}
                  collectionInfo = {collectionInfo}
                />
              </div>

              <div className="detail-group" >
                <NftDetailAccordion
                  nftInfo={nftInfo}
                  collectionInfo = {collectionInfo}
                  tokenId = {tokenId}
                  />
              </div>

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
                  !getFloorData ?
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
            contractAddress={contractAddress}
            tokenId = {tokenId}
          />
        </div >
      </div >
    </Layout >
  );
}

export default NftEtherDetail;
