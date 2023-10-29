import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Link } from "react-router-dom";
import { useAnchorWallet, useConnection } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { connectWallet, getBalance } from "../../../utiles/eth-interact";
import { MARKETPLACES_API } from "../../../config";
import commonService from "../../../config/services/common.service";
import Icons from "../../Global/Icons";
import MPDropDown from "../../Global/MPDropDown";
import InfoBox from "../../Global/InfoBox";

import './index.scss'

const itemData = [
  "Sol",
  "Eth"
]
export default ({ title, items, value }) => {
  const anchorWallet = useAnchorWallet()
  const { connection } = useConnection();

  const [depositCoin, setDepositCoin] = useState("Sol")
  const [dispalyMenu, setDisplayMenu] = useState(false)
  const navigate = useNavigate();

  const [solAddress, setSolAddress] = useState('')
  const [ethAddress, setEthAddress] = useState('')
  const [balance, setBalance] = useState({
    sol: 0,
    usdSol: 0,
    eth: 0,
    usdEth: 0
  })

  const ChangeRoute = (url) => {
    navigate(url, { replace: true })
  }

  useEffect(() => {
    (
      async () => {
        try {
          if (!anchorWallet) return
          const wallet = anchorWallet?.publicKey.toBase58()
          const res = wallet?.substr(0, 6) + '...' + wallet?.substr(wallet.length - 4, 4)
          setSolAddress(res)


          const get_global_status = await commonService({
            method: `get`,
            route: MARKETPLACES_API.GET_GLOBAL_STATUS
          })

          const get_sol_balance = await connection.getBalance(anchorWallet.publicKey)

          const sol_balance = (get_sol_balance / LAMPORTS_PER_SOL);
          setBalance({
            ...balance,
            sol: sol_balance.toFixed(2),
            usdSol: (Number(get_global_status?.solPrice).toFixed(2) * sol_balance).toFixed(2),

          })
        } catch (error) {
          console.log('error', error)
        }
      }
    )()


  }, [anchorWallet])

  useEffect(() => {
    (
      async () => {
        const walletResponse = await connectWallet();
        const eth_walletAddress = walletResponse.address?.substr(0, 6) + '...' + walletResponse.address?.substr(walletResponse.address.length - 4, 4)
        setEthAddress(eth_walletAddress)

        const get_global_status = await commonService({
          method: `get`,
          route: MARKETPLACES_API.GET_GLOBAL_STATUS
        })

        const eth_balance = await getBalance()

        setBalance({
          ...balance,
          eth: eth_balance.toFixed(2),
          usdEth: (eth_balance * Number(get_global_status?.ethPrice).toFixed(2)).toFixed(2)
        })

      }
    )()
  }, [])

  return (
    <InfoBox style={{ cursor: `pointer` }} className='relative' outSideClickFunc={setDisplayMenu}>
      <div style={{ display: `flex`, alignItems: `center`, gap: `36px` }} >
        {title ? (
          <div onClick={() => setDisplayMenu(true)}>
            <span className="mx-2 color-dim">
              {title}
              <span className="col-wht">
                {
                  !value
                    ? "Low - High"
                    : items.filter(item => item.value === value)[0].name
                }
              </span>
            </span>
            <Icons name={2} />{" "}
          </div>
        ) : (
          <div onClick={() => setDisplayMenu(true)}
            style={{ display: `flex`, alignItems: `center` }}
          >
            <span className="mx-2 content-title">Blockchain:</span>
            {
              anchorWallet ? <Icons name={1} /> : <Icons name={97} />
            }
            <span className="mx-2 color-spn">
              {
                anchorWallet ? `SOL` : `ETH`
              }
            </span> <Icons name={2} />{" "}
          </div>
        )}

        <Icons name={88} />

        {
          dispalyMenu ?
            <div className="menu-content">
              <div className="flexBox  brd-btm w-100">
                <div className="flexBox">
                  <Icons name={21} />
                  <div className="mx-2">
                    <h6 className="col-wht">
                      {anchorWallet ? solAddress
                        : ethAddress
                      }
                    </h6>
                    <div className="profile-linker" onClick={() => ChangeRoute('/profile')}>View Profile</div>
                  </div>
                </div>
                <div className="flexBox">
                  <div className="mx-3">
                    {" "}
                    <Icons name={22} />
                  </div>
                  <div className="mx-2" style={{ cursor: `pointer` }} onClick={() => setDisplayMenu(false)} >
                    <Icons name={29} />
                  </div>
                </div>
              </div>
              <div className="brd-btm wallet-balance">
                <p className="content-title">Wallet Balance</p>
                <div className="flexBox">
                  <div className="flexBox">
                    {
                      anchorWallet ? <Icons name={1} /> : <Icons name={97} />
                    }
                    <span className=" ss2">{anchorWallet ? balance.sol : balance.eth} {anchorWallet ? `SOL` : `ETH`}</span>
                  </div>
                  <span className="ss1">(${anchorWallet ? balance.usdSol : balance.usdEth})</span>
                </div>
              </div>
              <div className="my-2 p-2 brd-btm finance-actions">
                <Link href="#" className="my-1 ccH">
                  <Icons name={24} />
                  <span className="ss3 mx-2">Sell</span>
                </Link>

                <Link href="#" className="my-1 ccH">
                  <Icons name={25} />
                  <span className="ss3 mx-2">My Items</span>
                </Link>
                <Link href="#" className="my-1 ccH">
                  <Icons name={26} />
                  <span className="ss3 mx-2 ">Connect a different Wallet</span>
                </Link>
                <Link href="#" className="my-1 ccH">
                  <Icons name={27} />
                  <span className="ss3 mx-2">Favorites</span>
                </Link>
                <Link href="#" className="my-1 ccH">
                  <Icons name={28} />
                  <span className="ss3 mx-2">Settings</span>
                </Link>
              </div>
              <MPDropDown itemData={itemData} selectedValue={depositCoin} title={"Deposit"} changeValue={setDepositCoin} />
            </div>
            : <></>
        }
      </div>


    </InfoBox>

  );
};
