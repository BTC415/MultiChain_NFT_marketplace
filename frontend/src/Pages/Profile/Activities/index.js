import { useEffect } from 'react'
import Table from 'react-bootstrap/Table';
import { useState } from "react";
import Icons from '../../../components/Global/Icons';
import Listings from './tabs/listing';
import Sales from './tabs/sales';
import Bids from './tabs/bids';
import { MARKETPLACES_API, TIME_INCREASE, TIME_RANGE } from '../../../config';
import { useAnchorWallet } from '@solana/wallet-adapter-react';
import commonService from '../../../config/services/common.service';

import './index.scss'
import { connectWallet } from '../../../utiles/eth-interact';
import EtherListings from './tabs/Ethereum/listing';
import EtherSales from './tabs/Ethereum/sales';
import EtherBids from './tabs/Ethereum/bids';

const Activites = () => {
  const anchorWallet = useAnchorWallet();

  const activitesLists = [
    { title: `Listings`, icon: 78 },
    { title: `Purchase`, icon: 79 },
    { title: `Sales`, icon: 80 },
    { title: `Transfer`, icon: 81 },
    { title: `Burns`, icon: 82 },
    { title: `Likes`, icon: 83 },
    { title: `Bids`, icon: 84 },
  ]

  const Type = {
    List: 1,
    UnList: 2,
    UpdateList: 3,
    Buy: 4,
    MakeOffer: 5,
    UpdateOffer: 6,
    CancelOffer: 7,
    AcceptOffer: 8
  }

  const [isActive, setActive] = useState(0)
  const [typeList, setTypeList] = useState({
    listings: [],
    sales: [],
    bids: []
  })

  const [typeEthList, setTypeEthList] = useState({
    listings: [],
    sales: [],
    bids: []
  })

  const [profileTimer, setProfileTimer] = useState(0)

  const handleActive = (index) => {
    if (index === 0 || index) {
      setActive(index)
    }
  }

  const Buttoncst = ({ title, icon, isActive, index }) => {
    return <button onClick={() => handleActive(index)} className={isActive === index ? `tab-item-active` : `tab-item-passive`} key={index} >
      <div>
        <Icons name={icon} />
      </div>
      <div>
        <p>{title}</p>
      </div>
    </button>
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (!anchorWallet) {
            return
          }

          let _collectionActivities = await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_ACTIVITY_WALLET}`,
            data: {
              walletAddress: anchorWallet.publicKey.toBase58(),
              limit: 100,
              currentPage: 1
            }
          });

          const res_listing = _collectionActivities.rows.filter((item) => {
            return item.type === Type.List || item.type === Type.UpdateList
          })
          const res_sales = _collectionActivities.rows.filter((item) => {
            return item.type === Type.Buy || item.type === Type.AcceptOffer
          })

          const res_bids = _collectionActivities.rows.filter((item) => {
            return item.type === Type.MakeOffer || item.type === Type.UpdateOffer || item.type === Type.CancelOffer
          })

          setTypeList({
            listings: res_listing,
            sales: res_sales,
            bids: res_bids
          })
        } catch (error) {
          console.log('error', error)
        }

      }
    )()
    // }, [Type.AcceptOffer, Type.Buy, symbol])
  }, [anchorWallet, profileTimer])

  useEffect(() => {
    (
      async () => {
        try {
          const ethWallet = await connectWallet()

          let _collectionActivities = await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_ACTIVITY_WALLET}`,
            data: {
              walletAddress: ethWallet.address,
              limit: 100,
              currentPage: 1
            }
          });

          const res_listing = _collectionActivities.rows.filter((item) => {
            return item.type === Type.List || item.type === Type.UpdateList
          })
          const res_sales = _collectionActivities.rows.filter((item) => {
            return item.type === Type.Buy || item.type === Type.AcceptOffer
          })

          const res_bids = _collectionActivities.rows.filter((item) => {
            return item.type === Type.MakeOffer || item.type === Type.UpdateOffer || item.type === Type.CancelOffer
          })

          setTypeEthList({
            listings: res_listing,
            sales: res_sales,
            bids: res_bids
          })

          let profileValid = await ProfileTimeInterval();
          return () => clearInterval(profileValid)
        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  const ProfileTimeInterval = async () => {
    try {
      window.setInterval(async () => {
        setProfileTimer(timer => timer + TIME_INCREASE)
      }, 5 * TIME_RANGE)
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div className='activities-profile' >
      <div className='acitivites-list' >
        <div className='activites-status-group'>
          {
            activitesLists.map((item, index) => {
              return (
                <Buttoncst title={item.title} icon={item.icon} isActive={isActive} index={index} key={index} />
              )
            })
          }
        </div>
        <div className="t-box">
          <Table className="table-cst" responsive border={0}>
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Transaction ID</th>
                <th>Transaction Type</th>
                <th>Time</th>
                {
                  anchorWallet && <th>Mint Address</th>
                }

                {
                  isActive === 2 && <th>Buyer</th>
                }
                {
                  isActive === 2 && <th>Seller</th>
                }
              </tr>
            </thead>
            {
              anchorWallet ? <tbody>
                {isActive === 0 && <Listings activities={typeList.listings} />}
                {/* { isActive === 1 && <Listings /> } */}
                {isActive === 2 && <Sales activities={typeList.sales} />}
                {/* { isActive === 3 && <Listings /> } */}
                {/* { isActive === 4 && <Listings /> } */}
                {/* { isActive === 5 && <Listings /> } */}
                {isActive === 6 && <Bids activities={typeList.bids} />}

              </tbody> :
                <tbody>
                  {isActive === 0 && <EtherListings activities={typeEthList.listings} />}
                  {/* { isActive === 1 && <Listings /> } */}
                  {isActive === 2 && <EtherSales activities={typeEthList.sales} />}
                  {/* { isActive === 3 && <Listings /> } */}
                  {/* { isActive === 4 && <Listings /> } */}
                  {/* { isActive === 5 && <Listings /> } */}
                  {isActive === 6 && <EtherBids activities={typeEthList.bids} />}

                </tbody>
            }

          </Table>
        </div>
      </div>
    </div>
  )

}
export default Activites;