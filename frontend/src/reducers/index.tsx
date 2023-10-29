// import { COLLECTION_NAME, PRICE_NFT } from '../actiontypes'

const INITAL_STATE = {
  listed: [],
  mintAddress: '',
  createListStatus: false,
  cancelListStatus: false,
  AcceptBidStatus: false,
  metamask : ``,
  walletModal:false,
};


const reducer: any = (state = INITAL_STATE, action: any) => {
  switch (action.type) {
    case "PROFILE":
      return {
        ...state,
        image: action.payload.image,
        listed: action.payload.listed,
        mintAddress: action.payload.mintAddress,
        createListStatus: action.payload.createListStatus,
        cancelListStatus: action.payload.cancelListStatus,
        AcceptBidStatus: action.payload.AcceptBidStatus
      };
    case "METAMASK_CONNECT":
      return {
        ...state,
        metamask: action.payload.metamask,
        walletModal: action.payload.walletModal,
      };
    default:
      return state;
  }
};
export default reducer;
