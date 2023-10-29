import Web3 from 'web3'
import { EthToken } from "../../constants/interfaces";
import { ETH } from '../../config';

const { ERC721Contract, ERC721Abi, ERC1155Contract, ERC1155Abi, RPC } = ETH;

const web3 = new Web3(RPC);

const erc721Contract = new web3.eth.Contract(ERC721Abi.abi as any[], ERC721Contract);
const erc1155Contract = new web3.eth.Contract(ERC1155Abi.abi as any[], ERC1155Contract);

const getContract = (type: string) => {
  let contract = null;
  switch(type) {
    case 'ERC721':
      contract = erc721Contract;
      break;
    case 'ERC1155':
      contract = erc1155Contract;
      break;
    default: break
  }

  return contract;
}

const makeEthListTx = async (price: number, token: EthToken) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;
    let transaction = null;
    if (token.type === 'ERC721') {
      transaction = await contract.methods.createSale(
        token.contract, 
        token.id, 
        0,
        web3.utils.toWei(`${price}`),
        web3.utils.toWei(`${price}`),
        1
      );
      
    }
    
    web3.eth.abi
    if (transaction) {
      const tx = await web3.eth.accounts.signTransaction({
        data: transaction.encodeABI(),
        from: '0x9a005EebA94e4176De10318C8e16D8a0222bfF41',
        to: ERC721Contract,
        gas: 30000
      }, 'f89fdc3c8a8c8d59a4beb7e3bcef5c5615f8fcb1c2666770bf49dccc1497dd18')
      console.log('tx', tx);
      return transaction.encodeABI()
    };
    return null;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

const makeEthUpdateListTx = async (price: number, token: EthToken) => {
  try {
    const contract = getContract(token.type);
    if (contract) return null;
    let transaction = null;
    if (token.type === 'ERC721') {
      transaction = contract.methods.updateSale(
        token.contract, 
        token.id, 
        0,
        web3.utils.toWei(`${price} Eth`),
        web3.utils.toWei(`${price} Eth`),
        1
      );
  
    }
    if (transaction) return transaction.encodeABI();
    return null;
  }
  catch (error) {
    console.log('error', error);
    return null;
  }
}

const makeEthCancelListTx = async (token: EthToken) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;
    let transaction = null;

    if (token.type === 'ERC721') {
      transaction = contract.methods.cancelSale(
        token.contract, 
        token.id
      );
    }
    if (transaction) return transaction.encodeABI();
    return null;
    
  }
  catch(error) {
    console.log('error')
    return null;
  }
}

const makeEthBuyTx = async (token: EthToken) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;
    
    let transaction = null;
    if (token.type === 'ERC721') {
      transaction = contract.methods.buy(
        token.contract, 
        token.id
      );
    }

    if (transaction) return transaction.encodeABI();
    return null;
  }
  catch (error) {
    console.log('error');
    return null;
  }
}

const makeEthOfferTx = async (token: EthToken, price: number) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;

    let transaction = null;

    if (token.type === 'ERC721') {
      transaction = contract.methods.makeOffer(
        token.contract, 
        token.id,
        web3.utils.toWei(`${price} Eth`)
      );
    }
    if (transaction) return transaction.encodeABI();
    return null;
  }
  catch (error) {
    console.log('error');
    return null;
  }
}

const makeEthUpdateOfferTx = async (token: EthToken, price: number) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;

    let transaction = null;

    if (token.type === 'ERC721') {
      transaction = contract.methods.updateOffer(
        token.contract, 
        token.id,
        web3.utils.toWei(`${price} Eth`)
      );
    }
    if (transaction) return transaction.encodeABI();
    return null;
  }
  catch (error) {
    console.log('error');
    return null;
  }
}

const makeEthCancelOfferTx = async (token: EthToken) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;

    let transaction = null;
    if (token.type === 'ERC721') {
      transaction = contract.methods.cancelOffer(
        token.contract, 
        token.id,
      );
    }

    if (transaction) return transaction.encodeABI();
    return null;
  }
  catch (error) {
    console.log('error');
    return null;
  }
}

const makeEthAcceptOfferTx = async (token: EthToken) => {
  try {
    const contract = getContract(token.type);
    if (!contract) return null;

    let transaction = null;
    if (token.type === 'ERC721') {
      transaction = contract.methods.acceptOffer(
        token.contract, 
        token.id,
      );
    }

    if (transaction) return transaction.encodeABI();
    return null;
  }
  catch (error) {
    console.log('error');
    return null;
  }
}

export {
  makeEthListTx,
  makeEthUpdateListTx,
  makeEthCancelListTx,
  makeEthBuyTx,
  makeEthOfferTx,
  makeEthUpdateOfferTx,
  makeEthCancelOfferTx,
  makeEthAcceptOfferTx
}