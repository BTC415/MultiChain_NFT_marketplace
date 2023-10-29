import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { ToastContainer, toast } from 'react-toastify';
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { connectWallet, getCurrentWalletConnected } from "../../utiles/eth-interact";
import { chainId } from "../../constants/eth";
import "../../App.css";
import 'react-toastify/dist/ReactToastify.css';
import TopHeader from "../../components/Layout/TopHeader";
import Sidebar from "../../components/Layout/SideBar";
import Footer from "../../components/Layout/Footer";
import MobileTopBar from "../../components/Mobile Layout/MobileTopBar";
import { useMediaQuery } from "react-responsive";
import Modal from 'react-bootstrap/Modal';
import MenuSideBar from "../../components/Layout/MenuSideBar";
import { METAMASK_CONNECT } from "../../actions";

function App({ children }) {
  const dispatch = useDispatch()
  const storeData = useSelector(status => status)
  const [collapsed, setcollapsed] = React.useState(true);
  const [collapsedFilter, setcollapsedFilter] = React.useState(true);
  const [show, setShow] = React.useState(false);
  const [solSelected, setSolSelected] = React.useState(false);
  const [connectedWallet, setConnectedWallet] = React.useState("");
  const [walletAddress, setWalletAddress] = React.useState("");
  const [status, setStatus] = React.useState();
  const [disconnectEtherWallet, setDisconnectEtherWallet] = React.useState(false);
  const { setVisible } = useWalletModal();
  const wallet = useWallet();

  const handleClose = () => dispatch(METAMASK_CONNECT({
    walletModal: false
  }));
  const handleShow = () => dispatch(METAMASK_CONNECT({
    walletModal: true
  }));

  const isMobile = useMediaQuery({
    query: "(max-width: 768px)",
  });

  const handleEthWalletConnect = async () => {
    try {
      const walletResponse = await connectWallet();
      if (wallet) {
        await wallet.disconnect()
      }
      setStatus(walletResponse.status);
      setWalletAddress(walletResponse.address);
      setConnectedWallet("eth")
      handleClose()
      dispatch(METAMASK_CONNECT({
        metamask: `connected`
      }))
    } catch (error) {
      console.log('error', error)
    }

  }

  const handleSolWalletConnect = () => {
    setSolSelected(true);
    setVisible(true);
    dispatch(METAMASK_CONNECT({
      metamask: `disconnect`
    }))
    handleClose();
  }

  const notify = () => toast.info(status, {
    position: "top-right",
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });

  function addWalletListener() {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setConnectedWallet("eth");
          // setStatus("👆🏽 Ethereum Wallet is connected.");
        } else {
          setWalletAddress(null);
        }
      });
      window.ethereum.on("chainChanged", (chain) => {
        handleEthWalletConnect()
        if (chain !== chainId) {
        }
      });
      window.ethereum.on("disconnect", (error) => {
        console.log(error);
      })
    } else {
      setStatus(
        <p>
          {" "}
          🦊{" "}
          You must install Metamask, a virtual Ethereum wallet, in your
          browser.(https://metamask.io/download.html)
        </p>
      );
    }
  }

  useEffect(() => {
    if (status) {
      notify()
      setStatus(null)
    }
  }, [status]);

  useEffect(() => {
    (
      async () => {
        const { address, status } = await getCurrentWalletConnected()
        if (storeData.metamask === 'connected') {
          setWalletAddress(address)
        }
        setStatus(status)
        addWalletListener()
      }
    )();
  }, []);

  useEffect(() => {
    if (connectedWallet === "") {
      setWalletAddress("");
    }
  }, [connectedWallet])

  return (
    <>
      {isMobile ? (
        <MobileTopBar
          isMobile={isMobile}
          collapsed={collapsed}
          setcollapsed={setcollapsed}
          collapsedFilter={collapsedFilter}
          setcollapsedFilter={setcollapsedFilter}
        />
      ) : (
        <TopHeader
          connectModal={handleShow}
          solSelected={solSelected}
          setSolSelected={setSolSelected}
          connectedWallet={connectedWallet}
          setConnectedWallet={setConnectedWallet}
          walletAddress={walletAddress}
          setDisconnectEtherWallet={setDisconnectEtherWallet}

        />
      )}
      <div className="d-flex">
        <Sidebar
          isMobile={isMobile}
          collapsed={collapsed}
          setcollapsed={setcollapsed}
        />
        {isMobile ? (
          <MenuSideBar
            isMobile={isMobile}
            collapsed={collapsedFilter}
            setcollapsed={setcollapsedFilter}
          />
        ) : (
          <></>
        )}
        <div className="w-100 bd-dark">
          {children}
          <div className="mt-5">{!isMobile ? <Footer /> : <></>}</div>
        </div>
      </div>
      {isMobile ? <Footer /> : <></>}
      <Modal show={storeData.walletModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Select Wallet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div role="button" onClick={handleEthWalletConnect} >Ethereum Mainnet</div>
          <div className="" role="button" onClick={handleSolWalletConnect}>Solana</div>
        </Modal.Body>
      </Modal>
      <ToastContainer />
      {/* <ConnectWalletModal show={show} handleClose={handleClose}/> */}
    </>
  );
}

export default App;
