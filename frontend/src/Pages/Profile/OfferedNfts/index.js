import { useEffect, useState } from 'react'
import { useAnchorWallet } from '@solana/wallet-adapter-react'

import NFTCell from '../../../components/Global/NFTCell'
import SettingContent from '../SettingContent'
import commonService from '../../../config/services/common.service'
import { MARKETPLACES_API } from '../../../config'
import './index.scss'

const OfferedNfts = () => {
  const wallet = useAnchorWallet()

  const [isLoading, setLoading] = useState(false)
  const [offeredNfts, setOfferedNfts] = useState([])
  const offeredActive = true

  useEffect(() => {
    (
      async () => {
        try {
          if (!wallet) {
            return
          }
          setLoading(true)

          let _offersMadeList = await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_BID_WALLET}`,
            data: {
              walletAddress: wallet?.publicKey?.toString(),
              limit: 10,
              currentPage: 1
            }
          });
          const _offeredList = _offersMadeList.rows.filter((item) => item.status !== 2)
          setOfferedNfts([..._offeredList])

          setLoading(false)

        } catch (error) {
          console.log('error', error)
          setLoading(false)
        }
      }
    )()
  }, [wallet])

  return (
    <div className="offered-nfts">
      <SettingContent />
      {
        isLoading ? <div id="preloader"></div> :
          <div id="preloader" style={{ display: "none" }}></div>
      }

      <div className="nfts-list"  >
        {
          offeredNfts.length > 0 ?
            offeredNfts.map((item, index) => {
              return (
                <NFTCell
                  nft={item}
                  index={index}
                  offeredActive={offeredActive}
                  offeredNfts={offeredNfts}
                  setOfferedNfts={setOfferedNfts}
                  setLoading={setLoading}
                  key={index}
                />
              )
            })
            :
            <div className='no-nftGroup' >
              <p className='title' >Nothing Found</p>
              <p className='subTitle' >We couldn't find anything with this criteria</p>
            </div>
        }

      </div>

    </div>
  )
}

export default OfferedNfts