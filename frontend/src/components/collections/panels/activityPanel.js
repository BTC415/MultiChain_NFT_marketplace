import { useState, useEffect } from 'react'
import Table from 'react-bootstrap/Table';
import commonService from '../../../config/services/common.service';
import { MARKETPLACES_API, TIME_INCREASE, TIME_RANGE } from '../../../config';

import Icons from '../../Global/Icons';

import Listings from './activityPanel/Listings';
import Sales from './activityPanel/Sales';
import Bids from './activityPanel/Bids'

import EtherListings from './activityPanel/Ethereum/Listings';
import EtherSales from './activityPanel/Ethereum/Sales';
import EtherBids from './activityPanel/Ethereum/Bids';

import './index.scss'

const ActivityPanel = ({ chain, symbol }) => {
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

  const [collectionTimer, setCollectionTimer] = useState(0)

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
        if (chain === 'solana') {
          let _collectionActivities = await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_ACTIVITY_COLLECTION}`,
            data: {
              symbol: symbol,
              limit: 100,
              currentPage: 1
            }
          });

          const res_listing = _collectionActivities.rows.filter((item) => {
            return item?.type === Type.List
          })
          const res_sales = _collectionActivities.rows.filter((item) => {
            return item.type === Type.Buy || item.type === Type.AcceptOffer
          })

          const res_bids = _collectionActivities.rows.filter((item) => {
            return item.type === Type.MakeOffer || item.type === Type.CancelOffer || item.type === Type.UpdateOffer
          })

          setTypeList({
            listings: res_listing,
            sales: res_sales,
            bids: res_bids
          })
        } else if (chain === 'ether') {
          let _collectionActivities = await commonService({
            method: "post",
            route: `${MARKETPLACES_API.GET_ACTIVITY_COLLECTION}`,
            data: {
              contract: symbol,
              limit: 100,
              currentPage: 1
            }
          });

          const res_listing = _collectionActivities.rows.filter((item) => {
            return item.type === Type.List
          })

          const res_sales = _collectionActivities.rows.filter((item) => {
            return item.type === Type.Buy || item.type === Type.AcceptOffer
          })

          const res_bids = _collectionActivities.rows.filter((item) => {
            return item.type === Type.MakeOffer || item.type === Type.CancelOffer || item.type === Type.UpdateOffer
          })

          setTypeList({
            listings: res_listing,
            sales: res_sales,
            bids: res_bids
          })
        }
      }
    )()
  }, [symbol, collectionTimer])

  useEffect(() => {
    (
      async () => {
        try {
          let collectionValid = await CollectionTimeInterval();
          return () => clearInterval(collectionValid)
        } catch (error) {
          console.log('error', error)
        }
      }
    )()
  }, [])

  const CollectionTimeInterval = async () => {
    try {
      window.setInterval(async () => {
        setCollectionTimer(timer => timer + TIME_INCREASE)
      }, 5 * TIME_RANGE)
    } catch (error) {
      console.log('error', error)
    }
  }

  return (
    <div>
      <div className='flexBox jkdlasfj-samwke'>
        {
          activitesLists.map((item, index) => {
            return (
              <Buttoncst title={item.title} icon={item.icon} isActive={isActive} index={index} key={index} />
            )
          })
        }
      </div>
      <div>
        <div className="t-box">
          <Table className="table-cst" responsive border={0} style={{ position: `relative`, minHeight: `450px` }}  >
            <thead>
              <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Transaction ID</th>
                <th>Transaction Type</th>
                <th>Time</th>
                {chain === 'solana' && <th>Mint Address</th>}

                {
                  isActive === 2 && <th>Buyer</th>
                }
                {
                  isActive === 2 && <th>Seller</th>
                }
              </tr>
            </thead>
            {
              chain === 'solana' && <tbody >
                {isActive === 0 && <Listings activities={typeList.listings} />}
                {/* { isActive === 1 && <Listings /> }  */}
                {isActive === 2 && <Sales activities={typeList.sales} />}
                {/* { isActive === 3 && <Listings /> }
              { isActive === 4 && <Listings /> }
              { isActive === 5 && <Listings /> } */}
                {isActive === 6 && <Bids activities={typeList.bids} />}

              </tbody>
            }
            {
              chain === 'ether' && <tbody >
                {isActive === 0 && <EtherListings activities={typeList.listings} />}
                {/* { isActive === 1 && <Listings /> }  */}
                {isActive === 2 && <EtherSales activities={typeList.sales} />}
                {/* { isActive === 3 && <Listings /> }
              { isActive === 4 && <Listings /> }
              { isActive === 5 && <Listings /> } */}
                {isActive === 6 && <EtherBids activities={typeList.bids} />}

              </tbody>
            }
          </Table>
        </div>
      </div>
    </div>
  )
}

export default ActivityPanel

