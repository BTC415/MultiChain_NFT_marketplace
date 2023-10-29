export const serverUrl = "http://192.168.116.163:8000";
// export const serverUrl = "https://solsw.herokuapp.com";

export const API_URL = `${serverUrl}/api`;
export const MARKETPLACES_ETH_API = {
 GET_NFT_ITEM: `${API_URL}/nft/eth`,
 GET_COLLECTION : `${API_URL}/collection/eth/contract`,
 MAKE_NFT_OFFER : `${API_URL}/bid/eth/make`,
 RECEIVE_NFT_OFFER : `${API_URL}/bid/receive`,
 GET_ACCEPT: `${API_URL}/bid/eth/accept`,
 GET_ACTIVITY_NFT: `${API_URL}/activity/nft/`,
}

export const DECIMAL = 1000000000000000000

// 0x97B347CbCdEf0F9838b4DaF0D13019b2ed0dBF97 erc1155 contract address about any nft
// 0x1d1f38B2B1c02998aB62AeDd35973b0c8b1DcDD4 erc1155 contract address about any nft