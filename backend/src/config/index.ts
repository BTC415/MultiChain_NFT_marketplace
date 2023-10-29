import dotenv from "dotenv";
dotenv.config();

import KEYPAIR_DEV from './devnet.json';
import ERC721ABI from './ERC721Sale.json';
import ERC1155ABI from './ERC1155Sale.json';

export const jwtConfig = {
    secret: 'dd5f3089-40c3-403d-af14-d0c228b05cb4',
    refreshTokenSecret: '7c4c1c50-3230-45bf-9eae-c9b2e401c767',
    expireTime: '30m',
    refreshTokenExpireTime: '30m'
}

export const BAD_REQUEST = { success: false, message: 'Bad Request', data: null }
export const BACKEND_ERROR = { success: false, message: 'Backend Server Error!', data: null }

export const PROGRAM_ID = 'EJpcoKdCNCQUgauCLdLpiqC9EmaG8HEBZpCFqUDBMvZG';
export const DELEGATE_SEED = 'delegate';
export const BID_SEED = 'bid';
export const VAULT_SEED = 'vault';
export const KEYPAIR = KEYPAIR_DEV;
export const MAX_PRICE = 100000000;

export const ETH = {
    ERC721Contract: '0x20b8fbf7f7ef2a10f8e948e9f2dfff8214eb70ad',
    ERC721Abi: ERC721ABI,
    ERC1155Abi: ERC1155ABI,
    ERC1155Contract: '0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6',
    RPC: 'https://goerli.infura.io/v3/0f91cc85058741e1910dc423c59391fb',
    MORALIS_API_KEY: 'SxlGvC4i7dMygHzqGwESibtOC9swVewYaZVxyz2fcSxq9LVQeujmqYFIqNBtnWxt'
}

export const {
    PG_HOST,
    PG_USER,
    PG_DATABASE,
    PG_PASSWORD,
    PORT,
    JWT_SECRET,
    CLUSTER_API
} = process.env;

export const PG_PORT = 5432

