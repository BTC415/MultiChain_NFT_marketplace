import { useEffect } from "react";
import { useSelector } from "react-redux";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useMediaQuery } from "react-responsive";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import { useDispatch } from "react-redux";
import { METAMASK_CONNECT } from "../../actions";

export default ({ onClick, walletAddress, setConnectedWallet, setDisconnectEtherWallet }) => {
  const isMobile = useMediaQuery({
    query: "(max-width: 1000px)",
  });
  const anchorWallet = useAnchorWallet()
  const dispatch = useDispatch()
  const storeData = useSelector(status => status)
  const disconnectEthWallet = () => {
    dispatch(METAMASK_CONNECT({
      metamask: `disconnect`
    }))
    setConnectedWallet("");
    setDisconnectEtherWallet(true)
  }

  useEffect(() => {
    if (!walletAddress) {
      dispatch(METAMASK_CONNECT({
        metamask: `disconnect`
      }))
    } else {
      dispatch(METAMASK_CONNECT({
        metamask: `connected`
      }))
    }
  }, [walletAddress])

  return (
    <div className={`${isMobile ? "mw-f mx-2" : "mx-4"}`}>
      {
        anchorWallet ? <WalletMultiButton startIcon={undefined} />
          : storeData.metamask === 'connected' ? <button className="btn btn-prm" onClick={disconnectEthWallet} >{walletAddress.slice(0, 4) + '...' + walletAddress.substring(walletAddress.length - 4)}</button>
            : <button onClick={onClick} className="btn btn-prm">Connect Wallet</button>
      }

    </div>
  );
};
