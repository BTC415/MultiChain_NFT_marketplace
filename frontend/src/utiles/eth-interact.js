import { chainId } from "../constants/eth";
import { Contract, providers } from "ethers";
import Web3 from "web3";
import {
  MarketPlaceContractAddress
} from "../constants/abi";
import MarketplaceAbi from '../constants/abi/Marketplace.json'
import ERC721Token from '../constants/abi/ERC721.json'

export const TokenContract = (TokenContractAddress) => {
  const provider = new providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const TokenContract = new Contract(TokenContractAddress, ERC721Token, signer)
  return TokenContract
}


export const MarketPlaceContract = () => {
  const provider = new providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const marketContract = new Contract(MarketPlaceContractAddress, MarketplaceAbi.abi, signer)
  return marketContract
}

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      const chain = await window.ethereum.request({ method: 'eth_chainId' })
      if (chain === chainId) {
        const addressArray = await window.ethereum.request({
          method: 'eth_requestAccounts',
        })
        if (addressArray.length > 0) {
          return {
            address: await addressArray[0],
            // status: "👆🏽 Ethereum Wallet is connected.",
          }
        } else {
          return {
            address: "",
            status: "😥 Connect your wallet account to the site.",
          }
        }
      } else {
        window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chainId }],
        })
        return {
          address: "",
          status: "😥 Connect your wallet account to the site.",
        }
      }

    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      }
    }
  } else {
    return {
      address: "",
      status: "🦊 You must install Metamask, a virtual Ethereum wallet, in your browser.(https://metamask.io/download.html)"
    }
  }
}

export const getCurrentWalletConnected = async () => {
  if (window.ethereum) {
    try {
      const addressArray = await window.ethereum.request({
        method: "eth_accounts",
      })
      const chain = await window.ethereum.request({
        method: "eth_chainId",
      })
      if (addressArray.length > 0 && chain === chainId) {
        return {
          address: addressArray[0],
          // status: "👆🏽 Ethereum Wallet is connected.",
        }
      } else {
        return {
          address: "",
        }
      }
    } catch (err) {
      return {
        address: "",
        status: "😥 " + err.message,
      }
    }
  } else {
    return {
      address: "",
      status: "🦊 You must install Metamask, a virtual Ethereum wallet, in your browser.(https://metamask.io/download.html)"
    }
  }
}

export const getBalance = async () => {
  const web3 = new Web3(window.ethereum);
  const accounts = await web3.eth.getAccounts();
  const balance = await web3.eth.getBalance(accounts[0]);
  return balance / 1000000000000000000
}