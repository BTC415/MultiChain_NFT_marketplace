import { useNavigate } from 'react-router-dom';

import { ProSidebar, Menu, MenuItem, SubMenu } from "react-pro-sidebar";
import React from 'react'
import ConnectWallet from "./ConnectWallet";
import "react-pro-sidebar/dist/css/styles.css";
import Icons from "../Global/Icons";
import Modal from 'react-bootstrap/Modal';
import { connectWallet } from '../../utiles/eth-interact';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Link } from 'react-router-dom';

export default ({ collapsed, setcollapsed, isMobile }) => {
  const navigate = useNavigate();

  const [show, setShow] = React.useState(false);
  const [solSelected, setSolSelected] = React.useState(false);
  const [connectedWallet, setConnectedWallet] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");
  const { setVisible } = useWalletModal();

  const ChangeRoute = (url) => {
    navigate(url, { replace: true })
  }

  const handleEthWalletConnect = async () => {
    const walletResponse = await connectWallet();
    // setStatus(walletResponse.status);
    setWalletAddress(walletResponse.address);
    setConnectedWallet("eth")
  }

  const handleSolWalletConnect = () => {
    setSolSelected(true);
    setVisible(true);
    setShow(false);
  }

  return (
    <div className={`${isMobile ? "overlay-menu" : ""}`}>
      <ProSidebar
        collapsed={collapsed}
        className={`side-menu-cst`}
        collapsedWidth={isMobile ? "0px" : 34}
      >
        <Menu iconShape="square">
          {!isMobile ? (
            <MenuItem
              onClick={() => {
                setcollapsed(!collapsed);
              }}
            >
              <div
                className={`mx-2 d-flex ${collapsed ? "flex-end" : "flex-end"
                  }`}
              >
                <Icons name={collapsed ? 3 : 8} />
              </div>
            </MenuItem>
          ) : (
            <>
              <ConnectWallet
                onClick={() => setShow(true)}
                solSelected={solSelected}
                setSolSelected={setSolSelected}
                connectedWallet={connectedWallet}
                setConnectedWallet={setConnectedWallet}
                walletAddress={walletAddress}
              />
            </>
          )}
          <SubMenu
            title="Marketplace"
            icon={
              <>
                <Icons name={4} />
              </>
            }
          >
            <MenuItem onClick={() => ChangeRoute('/collection')}>All collection</MenuItem>
          </SubMenu>
          <SubMenu
            title="Insights"
            icon={
              <>
                <Icons name={5} />
              </>
            }
          >
            <MenuItem onClick={() => ChangeRoute('/collection')}>Stats</MenuItem>
          </SubMenu>
          <SubMenu
            title="Creators"
            icon={
              <>
                <Icons name={6} />
              </>
            }
          >
            <MenuItem onClick={() => alert()}>Apply for listing</MenuItem>
          </SubMenu>

          <MenuItem
            onClick={() => alert()}
            icon={
              <>
                <Icons name={7} />
              </>
            }
          >
            Apply for listing
          </MenuItem>
        </Menu>
        <div className={`sct ${collapsed ? "flex-column cssticon" : ""}`}>
          <div className="sicon">
            <Link href="#">
              <Icons name={9} />
            </Link>
          </div>
          <div className="sicon">
            <Link href="#">
              <Icons name={10} />
            </Link>
          </div>
          <div className="sicon">
            <Link href="#">
              <Icons name={11} />
            </Link>
          </div>
          <div className="sicon">
            <Link href="#">
              <Icons name={12} />
            </Link>
          </div>
        </div>
      </ProSidebar>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div role="button" onClick={handleEthWalletConnect} >Ethereum Mainnet</div>
          <div className="" role="button" onClick={handleSolWalletConnect}>Solana</div>
        </Modal.Body>
      </Modal>
    </div>
  );
};
