
// export const serverUrl = "https://solsw.herokuapp.com";
export const serverUrl = "http://192.168.116.163:8000";
export const RPC_HOST = 'https://metaplex.devnet.rpcpool.com/'
// export const RPC_HOST = 'https://api.devnet.solana.com/'
//add your api routes here...
export const routes = {
    news: serverUrl + "/news",
    drops: serverUrl + "/drop",
    guides: serverUrl + "/guide",
    advert: serverUrl + "/advertise",
    services: serverUrl + "/our-service",
    category: serverUrl + "/category",
};

export const API_URL = `${serverUrl}/api`;

export const MARKETPLACES_API = {
    FEATURED_COLLECTIONS: `${API_URL}/banner`,
    UPCOMING_LAUNCHES: `${API_URL}/collection/upcoming`,
    NEW_COLLECTIONS: `${API_URL}/collection/new`,
    POPULAR_COLLECTIONS: `${API_URL}/collection/popular`,
    GET_ANALYTICS: `${API_URL}/collection/analytics/`,
    GET_FLOOR_PRICE: `${API_URL}/collection/floor-price/`,

    DISCOUNTED_NFTS: `${API_URL}/nft/discounted`,

    GET_COLLECTIONS: `${API_URL}/collection`,
    ALL_COLLECTIONS: `${API_URL}/collection/all`,
    GET_COLLECTION_DATA: `${API_URL}/collection/symbol/`,
    GET_ACTIVITY_WALLET: `${API_URL}/activity/wallet/`,
    GET_ACTIVITY_NFT: `${API_URL}/activity/nft/`,
    GET_ACTIVITY_COLLECTION: `${API_URL}/activity/collection/`,

    GET_LIST_ITEM: `${API_URL}/nft/item/`,
    GET_BID_WALLET: `${API_URL}/bid/wallet/`,
    GET_TOP_BID: `${API_URL}/bid/top/`,
    GET_RECEIVE_BIDs: `${API_URL}/bid/receive/`,

    GET_NFT_LISTS: `${API_URL}/nft`,
    GET_COLLECTION_NFTS: `${API_URL}/getListedNFTsByQuery`,
    GET_NFT_DATA: `${API_URL}/bid/getBids?walletAddress=`,
    GET_OFFER_ITEM: `${API_URL}/bid/nft/`,
    GET_OFFER_NFT_WALLET: `${API_URL}/bid/nft-wallet/`,
    GET_NFTS_WALLET: `${API_URL}/nft/wallet/`,
    GET_MORE_NFTS: `${API_URL}/nft/more/`,
    GET_PRICE_HISTORY: `${API_URL}/nft/price/`,

    GET_BUY_TX: `${API_URL}/nft/buytx`,
    GET_BUY_TX_CONF: `${API_URL}/nft/buy`,
    GET_MAKEBID_TX: `${API_URL}/bid/maketx`,
    GET_CANCELBID_TX: `${API_URL}/bid/cancelTx`,
    GET_ACCEPT_TX: `${API_URL}/bid/acceptTx`,
    GET_ACCEPT_TX_CONFT: `${API_URL}/bid/accept`,
    GET_CANCELBID_TX_CONF: `${API_URL}/bid/cancel`,
    GET_MAKEBID_TX_CONF: `${API_URL}/bid/make`,
    GET_MAKELSIT_TX: `${API_URL}/nft/listtx`,
    GET_MAKELSIT_TX_CONF: `${API_URL}/nft/list`,
    GET_UPDATE_NFT_TX: `${API_URL}/nft/updatelisttx`,
    GET_UPDATE_NFT_TX_CONF: `${API_URL}/nft/update`,
    GET_UNLIST_NFT_TX: `${API_URL}/nft/unlisttx`,
    GET_UNLIST_NFT_TX_CONF: `${API_URL}/nft/unlist`,

    GET_SETTING: `${API_URL}/setting/key/`,
    GET_GLOBAL_STATUS: `${API_URL}/global/status`
}

export const SOLANA_CHAININFO = "https://api.solscan.io/market?symbol=SOL&cluster="
export const SOLANA_CHAININFO_TX = `https://api.solscan.io/chaininfo?cluster=`
export const ETH_GETINFO = `https://api.coinbase.com/v2/exchange-rates?currency=ETH`
export const GET_SOL_PRICE = `https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd,eur`;
export const GET_TPS = `http://solitary-white-violet.solana-mainnet.quiknode.pro/`;

export const DAYTIME = 86400; // one day
export const DECIMAL = 1000000000;
export const REWARD = [5, 10, 17];
export const DEFAULT = 2;
export const PERIOD = [7, 14, 21];

export const LAMPORTS = 0.000000001;

export const PROGRAM_ID = "DuaozRp7uvmiT78R5ZpYCzfLRoGatBrZL2uNEGam4bNn";

export const STATUS_TYPE = {
    List: 1,
    UnList: 2,
    UpdateList: 3,
    Buy: 4,
    MakeOffer: 5,
    UpdateOffer: 6,
    CancelOffer: 7,
    AcceptOffer: 8
}

export const TIME_INCREASE = 0.0000000001
export const TIME_RANGE = 1000

export const ErrImgUrl = "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTP-3QSHNAEBzr6s2fvf7hhOpnt0HGHthvDoGqFF3XQHg&s"

export const EVM_RPC_URL = 'https://goerli.infura.io/v3/0f91cc85058741e1910dc423c59391fb'

//   https://gateway.pinata.cloud/ipfs/QmRiLKmhizpnwqpHGeiJnL4G6fsPAxdEdCiDkuJpt7xHPH/

//   https://gateway.pinata.cloud/ipfs/EJeE19FQN9mCzdHXainR4Fxmk4sAJhomTquZSZpg3KipfxPiboHjVahsKgC875zREUwfBEqo3Ty5kUyM8jGNrVw/
//   https://gateway.pinata.cloud/ipfs/63wn1pgGEdTPbbG8iNhVJE7R2ZPYhykoUAkSCgWjADF5M2cM9dxviCdatr1UwTKbC1SzRQFRRCbkG7Q573HN5Y8L/
//   https://gateway.pinata.cloud/ipfs/4YhwQhp4VqsPfCZgcYwoSuhPGm4zQYQd5FC3hoC65iwHbNkFNRZKZGWj7j93yAjkBMzWE9oNH8c26Ln19ct974Jr/
//   https://gateway.pinata.cloud/ipfs/2r77bSavc8hjF7EJBXS7Y6jNDgMiNHjPcLuZJ6woFLRcvNCb98j6FRZBCFDZJbqvLZdyi3AsXJJZxq5iwzAtttBZ/

//   https://gateway.pinata.cloud/ipfs/3cuvUPkEzeWt4gbA5f6fobXarfjG8SNVFwtnEuAfsfZcvLrkTP5wZe5fXResnWqjq8DSL7N8niXw1tdkdo795Sup7/

