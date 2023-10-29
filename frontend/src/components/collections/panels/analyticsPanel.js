import React from 'react';
import MarketOverview from '../marketOverview'
import PriceDistribution from '../priceDistribution'
import PriceDistributionLong from '../priceDistributionlong'
import { useMediaQuery } from "react-responsive";
import Icons from '../../Global/Icons';
import Table from 'react-bootstrap/Table';


export default ({ chain, symbol }) => {
    return <div className='flexBox flexWrap' >
        <MarketOverview chain={chain} symbol={symbol} />
        <PriceDistribution />
        <PriceDistributionLong />
        <div className='w-100'>
            <h5>Recent Trades</h5>
            <div className="t-box">
                <Table className="table-cst" responsive border={0}>
                    <thead>
                        <tr>
                            <th>Item</th>
                            <th>Transferred from</th>
                            <th>Transferred to</th>
                            <th>Time</th>
                            <th>Price</th>

                        </tr>
                    </thead>
                    <tbody>
                        {
                            Array.from({ length: 13 }).map((_, i) => (<tr key={i} >

                                <td>
                                    <div className="d-flex align-items-center">
                                        <img src={require("../../../images/46.png")} />
                                        <p className="mx-4">PROOF Collective #2341</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>AthTE ... g7k</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>AthTE ... g7k</p>
                                    </div>
                                </td>

                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>3 hours ago</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <Icons name={1} />
                                        <p className="mx-2 sand-a2kewade">10 SOL</p>
                                    </div>
                                    <div>
                                        <h5 className='anbsdksa-oakew'>($2,312)</h5>
                                    </div>
                                </td>
                            </tr>))
                        }


                    </tbody>
                </Table>
            </div>
        </div>
        <div className='w-100 mt-5 jaksdlf-asmwe'>
            <h5>Top Collection Holders</h5>
            <div className="t-box">
                <Table className="table-cst" responsive border={0}>
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Holders</th>
                            <th>NFTs Owned</th>
                            <th>% of Supply</th>
                            <th>Total Floor Value</th>
                            <th>NFTs Listed</th>

                        </tr>
                    </thead>
                    <tbody>
                        {
                            Array.from({ length: 13 }).map((_, i) => (<tr key={i} >

                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>{i + 1}</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>58hp..dRDA</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>62</p>
                                    </div>
                                </td>





                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>1.5%</p>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">
                                        <Icons name={1} />
                                        <p className="mx-2 sand-a2kewade">10 SOL</p>
                                    </div>
                                    <div>
                                        <h5 className='anbsdksa-oakew'>($2,312)</h5>
                                    </div>
                                </td>
                                <td>
                                    <div className="d-flex align-items-center">

                                        <p>0</p>
                                    </div>
                                </td>
                            </tr>))
                        }


                    </tbody>
                </Table>
            </div>
        </div>
    </div>
}