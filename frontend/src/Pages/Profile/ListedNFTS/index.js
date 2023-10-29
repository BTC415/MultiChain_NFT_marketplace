import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useAnchorWallet } from "@solana/wallet-adapter-react";

import SettingContent from '../SettingContent'
import ListedNftCell from "./Solana/ListedNftCell"
import ListedEtherNftCell from "./Ethereum/ListedEtherNftCell";
import getCollectionSymbol from "../../../config/utils/getCollectionSymbol";

import './index.scss'
import Icons from "../../../components/Global/Icons";
import { API_URL, MARKETPLACES_API } from "../../../config";
import commonService from "../../../config/services/common.service";
import { connectWallet } from "../../../utiles/eth-interact";

function ListedNFTS() {
  const wallet = useAnchorWallet();
  const Data = useSelector((state) => state);

  const [nftShowStatus, setNftShowStatus] = useState(false);
  const [nftsInWallet, setNftsInWallet] = useState([]);
  const [collectionsInWallet, setCollectionsInWallet] = useState([]);

  const [listedNfts, setListedNfts] = useState([]);
  const [isLoading, setLoading] = useState(false)

  const [ethCollections, setEthCollections] = useState([]);
  const [ethNfts, setEthNfts] = useState([]);


  const getNftsInWalletByFilteredCollections = async (filteredCollections, nftsInWallet, isVerified) => {
    let result = []
    let resultCount = 0
    let _totalFloorValue = 0
    if (isVerified) {
      await Promise.all(await filteredCollections.map(async (collection) => {
        let filteredNtfs = []
        await nftsInWallet.forEach((nft) => {
          const symbol = getCollectionSymbol(nft?.name);
          if (symbol === collection?.nftName.toLowerCase())
            filteredNtfs.push({ name: nft?.name, image: nft?.image, mintAddress: nft?.mintAddress, price: nft?.price, symbol: collection?.symbol })

        });
        if (filteredNtfs.length === 0)
          return
        const fpResult = await commonService({
          method: "post",
          route: `${MARKETPLACES_API.GET_FLOOR_PRICE}`,
          data: {
            symbol: collection.symbol
          }
        });
        const floorPrice = fpResult.floorPrice

        result.push({
          collectionName: collection.name,
          collectionImg: collection.baseImage,
          symbol: collection.symbol,
          floorPrice,
          totalFloorValue: parseFloat(floorPrice) * filteredNtfs.length,
          items: filteredNtfs
        })
        _totalFloorValue += parseFloat(floorPrice) * filteredNtfs.length
        resultCount += filteredNtfs.length
      }))
    } else {
      let unverifiedSymbols = getUnverifiedCollectionSymbols(filteredCollections, nftsInWallet)
      nftsInWallet.forEach((nft) => {
        const symbol = getCollectionSymbol(nft.name);
        if (unverifiedSymbols.includes(symbol)) {
          result.push({ ...nft })
          resultCount++
        }
      });
    }
    return {
      data: result,
      count: resultCount
    }
  }

  const getUnverifiedCollectionSymbols = (filteredCollections, nftsInWallet) => {
    let symbolList = getListedCollectionSymbols(filteredCollections)
    let result = []
    nftsInWallet.forEach((nft) => {
      const symbol = getCollectionSymbol(nft.name)
      if (!symbolList.includes(symbol)) {
        result.push(symbol)
      }
    })
    return result
  }

  const getListedCollectionSymbols = (listedCollections) => {
    let result = [];
    try {
      for (let i = 0; i < listedCollections.length; i++) {
        if (listedCollections[i].symbol) {
          result.push(listedCollections[i].symbol);
        }
      }
    }
    catch (err) {
      result = [];
    }
    finally {
      return result;
    }
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (!wallet) return
          setLoading(true)

          let status = 1
          const get_listedNfts = await commonService({
            method: `get`,
            route: `${API_URL}/nft/wallet/${wallet.publicKey.toBase58()}/${status}`
          })
          const collectionsData = await commonService({
            method: "get",
            route: `${MARKETPLACES_API.GET_COLLECTIONS}`,
          });

          const collections = collectionsData.rows
          let creators = []
          collections.map((item) => {
            creators.push(...item.creators)
          })

          const _temp = await getNftsInWalletByFilteredCollections(collections, get_listedNfts, true)
          const result = _temp.data;
          console.log('result', result)
          setCollectionsInWallet([...result])

          let newNfts = [];
          for (let i = 0; i < result.length; i++) {
            newNfts = [...newNfts, ...result[i]?.items]
          }
          setNftsInWallet([...newNfts]);

          setLoading(false)

        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()
  }, [wallet])

  useEffect(() => {
    if (Data.createListStatus === true) {
      setListedNfts([...listedNfts, ...Data.listed])
    }

    if (Data.AcceptBidStatus === true) {
      const remain_nfts = listedNfts.filter((item) => item.mintAddress !== Data.mintAddress)
      setListedNfts([...remain_nfts])
    }

  }, [Data])

  useEffect(() => {
    (
      async () => {
        try {
          setLoading(true)
          const ethWallet = await connectWallet()

          let token_address = [];
          const collecion_info = await commonService({
            method: `get`,
            route: `${MARKETPLACES_API.GET_COLLECTIONS}/${ethWallet.address}`
          })
          for (let i = 0; i < collecion_info.result.length; i++) {
            token_address.push(collecion_info.result[i].token_address)
          }

          let _collections = await commonService({
            method: "get",
            route: `${MARKETPLACES_API.GET_COLLECTIONS}`,
          });
          // verify collections

          const verified_collections = _collections.rows.filter(item => {
            return token_address.includes(item?.contract?.toLowerCase())
          })
          let token_nft_address = [];
          for (let i = 0; i < _collections.rows.length; i++) {
            if (_collections.rows[i].chain === 1) {
              token_nft_address.push(_collections.rows[i].contract.toLowerCase())
            }
          }

          let status = 1
          const get_listedNfts = await commonService({
            method: `get`,
            route: `${API_URL}/nft/wallet/${ethWallet.address}/${status}`
          })

          const verified_nfts = get_listedNfts.filter(item => {
            return token_nft_address.includes(item?.token_address)
          })
          let result = []
          await Promise.all(await verified_collections.map(async (collection) => {
            let filteredNtfs = []

            await verified_nfts.forEach((nft) => {
              if (collection.contract.toLowerCase() === nft?.token_address.toLowerCase()) {
                filteredNtfs.push({
                  metadata: JSON.parse(nft?.metadata),
                  name: nft?.name,
                  token_address: nft?.token_address,
                  token_id: nft?.token_id,
                  owner: nft?.owner_of,
                  symbol: nft?.symbol
                })
              }
            })

            result.push({
              image: collection?.baseImage,
              name: collection?.name,
              items: filteredNtfs
            })
          }))
          setEthCollections(result)

          setLoading(false)
        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()
  }, [])

  return (
    <div className="listed-nfts">
      <SettingContent />
      {
        isLoading ? <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }

      {
        nftShowStatus && <div className="back-arrow" style={{ cursor: `pointer` }} onClick={() => setNftShowStatus(false)}  >
          <Icons name={32} />
          <h4>Back</h4>
        </div>
      }

      {
        wallet ?
          <div className='nfts-list' >

            {
              !nftShowStatus && (collectionsInWallet.length > 0 ?
                collectionsInWallet.map((item, index) => {
                  return (
                    <ListedNftCell
                      nft={item}
                      index={index}
                      setLoading={setLoading}
                      nftShowStatus={nftShowStatus}
                      collectionsInWallet={collectionsInWallet}
                      setNftShowStatus={setNftShowStatus}
                      setNftsInWallet={setNftsInWallet}
                      key={index}
                    />
                  )
                })
                :
                <div className='no-nftGroup' >
                  <p className='title' >Nothing Found</p>
                  <p className='subTitle' >We couldn't find anything with this criteria</p>
                </div>)
            }

            {
              nftShowStatus && (nftsInWallet.length > 0 ?
                nftsInWallet.map((item, index) => {
                  return (
                    <ListedNftCell
                      nft={item}
                      index={index}
                      setLoading={setLoading}
                      nftShowStatus={nftShowStatus}
                      setNftShowStatus={setNftShowStatus}
                      setNftsInWallet={setNftsInWallet}
                      key={index}
                    />
                  )
                })
                :
                <div className='no-nftGroup' >
                  <p className='title' >Nothing Found</p>
                  <p className='subTitle' >We couldn't find anything with this criteria</p>
                </div>)
            }
          </div>
          :

          <div className='nfts-list' >

            {
              !nftShowStatus && (ethCollections.length > 0 ?
                ethCollections.map((item, index) => {
                  return (
                    <ListedEtherNftCell
                      nft={item}
                      index={index}
                      nftShowStatus={nftShowStatus}
                      ethCollections={ethCollections}
                      setNftShowStatus={setNftShowStatus}
                      setEthNfts={setEthNfts}
                      key={index}
                    />
                  )
                })
                :
                <div className='no-nftGroup' >
                  <p className='title' >Nothing Found</p>
                  <p className='subTitle' >We couldn't find anything with this criteria</p>
                </div>)
            }

            {
              nftShowStatus && (ethNfts.length > 0 ?
                ethNfts.map((item, index) => {
                  return (
                    <ListedEtherNftCell
                      nft={item}
                      index={index}
                      nftShowStatus={nftShowStatus}
                      setNftShowStatus={setNftShowStatus}
                      ethNfts={ethNfts}
                      setEthNfts={setEthNfts}
                      key={index}
                    />
                  )
                })
                :
                <div className='no-nftGroup' >
                  <p className='title' >Nothing Found</p>
                  <p className='subTitle' >We couldn't find anything with this criteria</p>
                </div>)
            }
          </div>
      }



    </div>
  );
}

export default ListedNFTS;
