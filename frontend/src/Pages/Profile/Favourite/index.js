import { useState } from 'react'
import './index.scss'

const Favourite = () => {
  const [favouriteLists, setFavouriteLists] = useState([])

  return (
    <div className='favourite-profile' >
      <div className='favourite-list' >
        {
          favouriteLists.length > 0 ?
            <></>
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

export default Favourite