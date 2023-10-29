import { useEffect, useState } from "react";
import MenuButton from "../MenuButton";
import { useMediaQuery } from "react-responsive";

import { useAnchorWallet } from "@solana/wallet-adapter-react";
import commonService from "../../../config/services/common.service";
import { MARKETPLACES_API } from "../../../config";
import ConnectWallet from "../ConnectWallet";
import LogoImg from '../../../images/logo/arena.png'
import './index.scss'

export default ({ connectModal, solSelected, walletAddress, setConnectedWallet, connectedWallet, setSolSelected, setDisconnectEtherWallet }) => {
  const anchorWallet = useAnchorWallet()
  const [statusInfo, setStatusInfo] = useState({
    volume24h: 0,
    volumeTotal: 0,
    soltoUsd: 0,
    ethtoUsd: 0,
    solTx: 0
  })
  // https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=BTC,USD,EUR
  useEffect(() => {
    (
      async () => {
        const get_global_status = await commonService({
          method: `get`,
          route: MARKETPLACES_API.GET_GLOBAL_STATUS
        })

        setStatusInfo({
          ...statusInfo,
          volume24h: get_global_status?.volume24h,
          volumeTotal: Number(get_global_status?.totalVolume).toFixed(2),
          soltoUsd: Number(get_global_status?.solPrice).toFixed(2),
          ethtoUsd: Number(get_global_status?.ethPrice).toFixed(2),
          solTx: Number(get_global_status?.solTps).toFixed(2)
        })

      }
    )()
  }, [])

  const hidesolana = useMediaQuery({
    query: "(max-width: 1338px)",
  });
  const hideEth = useMediaQuery({
    query: "(max-width: 1143px)",
  });
  const hideUSD = useMediaQuery({
    query: "(max-width: 1014px)",
  });
  return (
    <section className="top-header">
      <div className="flexBox w-100">
        <div className=" header-left ">
          <img src={LogoImg} className="logo" />
          <div className="general-degen-room" >
            <div />
            <p>General Degen room</p>
          </div>
        </div>
        <div className="mid-bx flexBox">
          <h3>
            Volume 24h:<span className="mx-1">{Number(statusInfo.volume24h).toFixed(2)} USD</span>
          </h3>
          <h3>
            Volume total:<span className="mx-1">{Number(statusInfo.volumeTotal).toFixed(2)} USD</span>
          </h3>

          {hideUSD ? (
            <></>
          ) : (
            <h3>
              {/* SOL/USD<span>${marketplaceInfo.solUsd}</span> */}
              SOL/USD<span>$ {Number(statusInfo.soltoUsd).toFixed(2)} </span>
            </h3>
          )}

          {hideEth ? (
            <></>
          ) : (
            <h3>
              {/* ETH/USD<span className="mx-1">${marketplaceInfo.ethUsd}</span> */}
              ETH/USD<span className="mx-1">$ {Number(statusInfo?.ethtoUsd).toFixed(2)} </span>
            </h3>
          )}

          {hidesolana ? (
            <></>
          ) : (
            <>
              <h3>
                {/* Solana Network:<span className="mx-1">{marketplaceInfo.tps} TPS</span> */}
                Solana Network:<span className="mx-1"> {Number(statusInfo.solTx).toFixed(2)} TPS</span>
              </h3>
            </>
          )}
        </div>
        <div className="logo-4 flexBox">
          <MenuButton isMenu={true} />
          <ConnectWallet
            onClick={connectModal}
            setSolSelected={setSolSelected}
            solSelected={solSelected}
            walletAddress={walletAddress}
            connectedWallet={connectedWallet}
            setConnectedWallet={setConnectedWallet}
            setDisconnectEtherWallet={setDisconnectEtherWallet}
          />
        </div>
      </div>
    </section>
  );
};
