import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { getParsedNftAccountsByOwner, } from "@nfteyez/sol-rayz";

import 'react-loading-skeleton/dist/skeleton.css'
import { Connection, PublicKey, SystemProgram, Keypair, Transaction } from "@solana/web3.js";


import MPDropDown from '../../components/Global/MPDropDown'
import Layout from '../../components/Layout'
import Table from 'react-bootstrap/Table';
import Icons from "../../components/Global/Icons";
import { serverUrl } from "../../config";
import { useMediaQuery } from "react-responsive";

import "./index.scss";

import { MARKETPLACES_API } from "../../config";
import commonService from "../../config/services/common.service";

function AllCollections() {
  const [selectedPeriod, setSelectedPeriod] = useState("low")
  const [isLoading, setIsLoading] = useState(false);
  const [collections, setCollections] = useState([])

  const isMobile = useMediaQuery({
    query: "(max-width:768px)"
  })

  const itemData = [
    "low",
    "middle",
    "high"
  ]

  const allCollectionHeaderFields = [
    { name: `#` },
    { name: `Collection` },
    { name: `Volume Total` },
    { name: `24 h Volume` },
    { name: `24 h % Volume` },
    { name: `Sales` },
    { name: `Floor Price` },
    { name: `Owners` },
    { name: `Total Supply` },
  ]

  useEffect(() => {
    (
      async () => {
        try {
          setIsLoading(true);

          let _collections = await commonService({
            method: "get",
            route: `${MARKETPLACES_API.GET_COLLECTIONS}`,
          });

          const collectionData = await Promise.all(

            _collections.rows.map(async (collection) => {
              return await commonService({
                method: 'get',
                route: `${MARKETPLACES_API.GET_COLLECTION_DATA}${collection.symbol}`
              })
            })
          )
          setCollections([...collectionData])

          setIsLoading(false);
        } catch (error) {
          console.log('error', error)
          setIsLoading(false);
        }
      }
    )();
  }, [])

  return (
    <Layout>
      <div className="allCollection-page">
        <div className="allCollection-container" >
          <h5 className="allCollection-title">All Collections</h5>
          <div className="allCollection-control" >
            <div className="filter-search-group" >
              <MPDropDown itemData={itemData} selectedValue={selectedPeriod} title={"period"} changeValue={setSelectedPeriod} />
              <div className='collection-search'>
                <Icons name={70} />
                <input
                  type={"text"}
                  placeholder='Search a trait in this collection, or the ID'
                // value={value}
                // onChange={(e) => action(e.target.value)}
                />
              </div>
            </div>
            <div className={`t-box ${collections ? `table-control` : `table-control-height`} `}>
              <Table className="table-cst" responsive border={0}>
                <thead>
                  <tr>
                    {
                      allCollectionHeaderFields.map((item, idx) =>
                        <th key={idx}
                          className={(isMobile && idx !== 0) ? `allCol-th` : ``}
                          style={{ padding: `20px` }}
                        >{item.name}</th>
                      )
                    }
                  </tr>
                </thead>
                <tbody>
                  {
                    collections ?
                      collections.length > 0
                        ? collections.map((item, index) => (
                          <tr key={index} className='tbody-tr' >
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p>{index + 1}</p>
                                  </div>
                              }
                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    {
                                      !!item?.baseImage && <img src={`${serverUrl}${item.baseImage}`}
                                        alt="img"
                                        style={{ width: "60px", height: "60px", borderRadius: "16px" }}

                                      />
                                    }
                                    {
                                      item?.chain === 0 && <Link to={`/collection/${`solana`}/${item.symbol}`} className='no-underline'
                                        style={{ textDecoration: `none` }}
                                      >
                                        <p className="mx-4">{item.name}</p>
                                      </Link>
                                    }
                                    {
                                      item?.chain === 1 && <Link to={`/collection/${`ether`}/${item.contract}`} className='no-underline'
                                        style={{ textDecoration: `none` }}
                                      >
                                        <p className="mx-4">{item.name}</p>
                                      </Link>
                                    }
                                  </div>
                              }

                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p className="mx-2">{item?.totalVolume ? Number(item?.totalVolume).toFixed(2) : 0}</p>
                                    <Icons name={item.chain === 1 ? 97 : 1} />
                                  </div>
                              }

                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p className="mx-2 ">{item?.volume24h ? Number(item?.volume24h).toFixed(2) : 0}</p>
                                    <Icons name={item.chain === 1 ? 97 : 1} />
                                  </div>
                              }

                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <div className="m-2">
                                      <Icons name={item?.percent24h > 0 ? 30 : 31} />
                                    </div>
                                    <p><span
                                      style={{ color: item?.percent24h > 0 ? `#53FFFC` : `#F13D3D` }}
                                    >{item?.percent24h ? (item?.percent24h).toFixed(2) : 0}</span></p>
                                  </div>
                              }

                            </td>
                            <td>

                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p>{item?.purchased ? item?.purchased : 0}</p>
                                  </div>
                              }
                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p className="mx-2">{item?.floorPrice ? item?.floorPrice : 0}</p>
                                    <Icons name={item.chain === 1 ? 97 : 1} />
                                  </div>
                              }

                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p>{item?.uniqueHolders}</p>
                                  </div>
                              }

                            </td>
                            <td>
                              {
                                isLoading ?
                                  <SkeletonTheme baseColor="#202020" highlightColor="#444">
                                    <p>
                                      <Skeleton count={1} />
                                    </p>
                                  </SkeletonTheme>
                                  :
                                  <div className="d-flex align-items-center">
                                    <p>{item?.totalSupply}</p>
                                  </div>
                              }

                            </td>
                          </tr>))
                        :
                        (
                          new Array(5).fill(undefined).map((data, index) => {
                            return (
                              <tr key={index} >
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                                <td><SkeletonTheme baseColor="#202020" highlightColor="#444">
                                  <p>
                                    <Skeleton count={1} />
                                  </p>
                                </SkeletonTheme></td>
                              </tr>
                            )
                          })
                        )
                      :

                      <div className='no-nftGroup' >
                        <p className='title' >Nothing Found</p>
                        <p className='subTitle' >We couldn't find anything with this criteria</p>
                      </div>
                  }
                </tbody>
              </Table>
            </div>
          </div>
        </div>
      </div>
    </Layout >
  );
}

export default AllCollections;
