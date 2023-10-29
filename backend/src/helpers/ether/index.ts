
import Moralis from 'moralis';
import { EvmChain } from '@moralisweb3/evm-utils'

// const chain = EvmChain.GOERLI;
const chain = EvmChain.MUMBAI;

export const getHolders = async (contract: string) => {
  let holders: any[] = [];
  try {
    const chain = EvmChain.GOERLI;
    const response = await Moralis.EvmApi.nft.getNFTOwners({
      address: contract,
      chain
    });

    holders = response.toJSON().result;
  }
  catch (error) {
    console.log('error', error);
  }

  return holders;
}

export const getCollectionInfo = async (contract: string) => {
  let info = null;
  try {
    const response = await Moralis.EvmApi.nft.getContractNFTs({
      address: contract,
      chain
    })

    info = response?.toJSON();
  }
  catch (error) {
    console.log('error', error);
  }

  return info;
}

export const getNftMetadata = async (contract: string, id: number) => {
  let metadata: any = null;
  try {
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      address: contract,
      chain,
      tokenId: `${id}`
    });

    metadata = response?.toJSON();
  }
  catch (error) {
    console.log('error', error);
  }

  return metadata;
}

export const getCollectionsByWallet = async (wallet: string) => {
  try {
    const response = await Moralis.EvmApi.nft.getWalletNFTCollections({
      address: wallet,
      chain,
    });

    return response.toJSON();
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

export const getNftsByWallet = async (wallet: string) => {
  try {

    const response = await Moralis.EvmApi.nft.getWalletNFTs({
      address: wallet,
      chain,
    });

    return response.toJSON();
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

export const getNftInfo = async (contract: string, id: number) => {
  try {
    const response = await Moralis.EvmApi.nft.getNFTMetadata({
      address: contract,
      tokenId: `${id}`,
      chain
    });

    console.log('response', response)
    return response.toJSON();
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}