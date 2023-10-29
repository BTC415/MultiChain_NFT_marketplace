import React, {useState} from "react";
import {useNavigate} from 'react-router-dom';
import MenuButton from "../../components/Layout/MenuButton";
import Layout from '../../components/Layout'
import Table from 'react-bootstrap/Table';
import Icons from "../../components/Global/Icons";
import Search from '../../components/Global/search';
import AdminCollectionManageModal from '../../components/Modals/AdminCollectionManageModal'
import "./index.scss";

function Admin() {
  const [displayModal, setDisplayModal] = useState(false)
  const navigate = useNavigate();
  const ChangeRoute = (url) => {
    navigate(url, {replace: true})
  }
  return (

    <Layout>
      <div className="layout-box p-5">
        <h5 className="all-c page-title">Listing Application Response</h5>
        <p className="page-description">Accept or decline users application</p>
        <div className="total-info">
          <div className="info-cell">
            <p className="subscription-color">Pending Response</p>
            <p className="info-data">4</p>
          </div>
          <div className="info-cell">
            <p className="subscription-color">Accepted Collection</p>
            <p className="info-data">4</p>
          </div>
          <div className="info-cell">
            <p className="subscription-color">Decliend collection</p>
            <p className="info-data">4</p>
          </div>
        </div>
        <div className="collection-table">
          <div className="table-header d-flex justify-content-between">
            <div className="sort-info d-flex">
              <MenuButton
                subTitle={": All time"}
                title={"Period"}
                />
              <MenuButton
                subTitle={": All"}
                title={"Status"}
                />

            </div>
            <Search/>
          </div>
          <div className="t-box">
            <Table className="table-cst" responsive border={0}>
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Collection Name</th>
                  <th>NFTs Type</th>
                  <th>Collection Description</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {
                  Array.from({ length: 13 }).map((_, i) => (<tr className="collection-cell">
                    
                    <td>
                      <div className="d-flex align-items-center">
                        <img src={require("../../images/46.png")} />
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center collection-name" onClick={()=>ChangeRoute('/collection')}>
                        <p className="mx-2">PROOF Collective</p>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <p className="mx-2">Collection</p>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <p className="mx-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sit miN pharetra...more</p>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <p className="mx-2 ">20/09/22</p>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="m-2 pending-collection">
                          <p className="mx-2 ">Pending</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div onClick={()=>setDisplayModal(true)} className="d-flex align-items-center view-detail">

                        <p>View Details</p>
                      </div>
                    </td>
                    
                  </tr>))
                }


              </tbody>
            </Table>
          </div>
        
        </div>
        
      </div>
      <AdminCollectionManageModal show={displayModal} onHide={()=>setDisplayModal(false)}/>
    </Layout>
  );
}

export default Admin;
