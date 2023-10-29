import { useState } from 'react'
import SettingContent from '../SettingContent'
import NFTPanel from '../../../components/Global/NFTPanel'

import './index.scss'


const MyCustodialNFTS = () => {

  const [custodialNfts, setCustodialNfts] = useState([])

  return (
    <div className="my-nfts">
      <SettingContent />

      <div className='nfts-list' >
        {
          custodialNfts.length > 0 ?
            <NFTPanel nfts={custodialNfts} />
            :
            <div className='no-nftGroup' >
              <p className='title' >Nothing Found</p>
              <p className='subTitle' >We couldn't find anything with this criteria</p>
            </div>
        }
      </div>
    </div>
  );
}

export default MyCustodialNFTS;
