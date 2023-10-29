import { Request, Response } from 'express'
import BidService from '../services/bid'
import ActivityService from '../services/activity'
import HashlistService from '../services/hashlist'
import NftService from '../services/nft'
import WalletService from '../services/wallet'
import CollectionService from '../services/collection'

import { BAD_REQUEST, BACKEND_ERROR, CLUSTER_API, PROGRAM_ID } from '../config'
import { ACTIVITY_TYPE } from "../constants"

import Sequelize from "sequelize"
const Op = Sequelize.Op

import bs58 from "bs58"
import {
    resolveToWalletAddress,
    getParsedAccountByMint,
} from "@nfteyez/sol-rayz"

import {
    makeBidTx,
    makeUpdateBidTx,
    makeCancelBidTx,
    makeAcceptBidTx,
} from "../helpers/contract"

import { PublicKey, Connection, Keypair } from "@solana/web3.js"

import { SolanaClient } from '../helpers/solana'
import bid from '../services/bid'
import { INTERVAL, LOOP, KEYPAIR } from '../config/dev'
import { delay } from '../helpers/methods'
const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(KEYPAIR).slice(0, 32));

const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API })

const connection = new Connection(CLUSTER_API, 'confirmed')

// User Panel
const getBidByNftAndWallet = async (req: Request, res: Response) => {
    try {
        const { mintAddress, walletAddress } = req.body
        if (mintAddress === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                mintAddress,
                walletAddress,
                status: 1
            }
        }
        const result = await BidService.findOne(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getBidsByWallet = async (req: Request, res: Response) => {
    try {
        const { walletAddress, limit, currentPage } = req.body
        if (walletAddress === undefined || limit === undefined || currentPage === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                walletAddress,
                status: {
                    [Op.ne]: 0
                }
            },
            order: [['updated_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }

        const bids = await BidService.findAndCountAll(condition)

        for (let i = 0; i < bids.rows.length; i++) {
            const nft = await NftService.findOne({ where: { mintAddress: bids.rows[i].mintAddress } })
            if (bids.rows[i].status === 1 && nft.status === 3) {
                bids.rows[i].status = 3
            }
        }
        return res.status(200).json({ success: true, data: bids, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getReceivedBids = async (req: Request, res: Response) => {
    try {
        const { walletAddress, limit, currentPage } = req.body
        console.log('wallet', walletAddress);
        if (walletAddress === undefined || limit === undefined || currentPage === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        let filters = {
            [Op.or]: []
        }

        const listedNFTs = await NftService.findAll({ where: { walletAddress } })
        console.log(listedNFTs)
        for (let i = 0; i < listedNFTs.length; i ++ ) {
            const nft = listedNFTs[i];
            const collection = await CollectionService.findOne({
                where: {
                    id: nft.collectionId
                }
            })
            if (collection) {
                if (collection.chain === 0 ) {
                    filters[Op.or].push({
                        mintAddress: `${nft.mintAddress}`
                    })
                }
                else {
                    filters[Op.or].push({
                        collectionId: nft.collectionId,
                        nftId: nft.nftId
                    })
                }
            }
        }
        const condition = {
            where: {
                ...filters,
                status: 1
            },
            order: [['updated_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }

        const bids = await BidService.findAndCountAll(condition)

        let bidList = []
        bids.rows.map((bid: any, index: any) => {
            const nft = listedNFTs.filter((item: any) => item.mintAddress === bid.mintAddress || (item.collectionId === bid.collectionId && item.nftId === bid.nftId))
            bidList.push({ ...bid.dataValues, price: nft[0].price, listed: nft[0].status })
        })
        const result = {
            count: bids.count,
            rows: bidList
        }

        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        console.log('error', err)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getBidsByNFT = async (req: Request, res: Response) => {
    try {
        const { mintAddress, limit, currentPage } = req.body
        if (mintAddress === undefined || limit === undefined || currentPage === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                mintAddress,
                status: 1
            },
            order: [['updated_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }
        const result = await BidService.findAndCountAll(condition)
        res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getTopBidByNFT = async (req: Request, res: Response) => {
    try {
        const { mintAddress } = req.body
        if (mintAddress === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                mintAddress,
                status: 1
            },
            order: [['offerPrice', 'DESC']]
        }

        const result = await BidService.findAll(condition)

        if (result === null) {
            return res.status(200).json({ success: true, data: null, message: 'Success' })
        }
        return res.status(200).json({ success: true, data: result[0], message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

// Make Bid Nft
const makeBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress, offerPrice, signature } = req.body

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i ++) {
              await delay(INTERVAL);
              parsedTxn = await connection.getParsedTransaction(signature);
              if (parsedTxn) break;
            }
        }
        if (!parsedTxn.meta) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        if (parsedTxn.meta.err !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const programAccount = parsedTxn.transaction.message.accountKeys.find(account => account.pubkey.toString() === PROGRAM_ID);
        if (!programAccount) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const admin = parsedTxn.transaction.message.accountKeys.find(account => account.signer && account.pubkey.toString() === ADMIN_WALLET.publicKey.toString());
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: CreateBid'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress,
                status: 1
            }
        })

        if (nftResult === null) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress,
            }
        })
        let bidResult: any
        if (oldBid === null) {
            const data = {
                image: accountInfo.image,
                name: accountInfo.name,
                mintAddress,
                walletAddress: bidderAddress,
                offerPrice,
                currentPrice: nftResult.price,
                status: 1
            }

            bidResult = await BidService.create(data)
        } else {
            if (oldBid.status === 2) {
                const data = {
                    walletAddress: bidderAddress,
                    offerPrice,
                    currentPrice: nftResult.price,
                    status: 1
                }
                const condition = {
                    where: {
                        mintAddress,
                        walletAddress: bidderAddress
                    },
                    returning: true,
                    plain: true
                }
                bidResult = await NftService.update(data, condition)[1].dataValues
            }
        }

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            image: accountInfo.image,
            name: accountInfo.name,
            type: ACTIVITY_TYPE.PLACED_BID,
            price: offerPrice,
            from: bidderAddress,
            to: '',
            signature,
            status: 1,
        }
        await ActivityService.create(activity)
        return res.status(200).json({ success: true, data: bidResult, message: 'Success' })

    } catch (err) {
        console.log('error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress, offerPrice, signature } = req.body

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i ++) {
              await delay(INTERVAL);
              parsedTxn = await connection.getParsedTransaction(signature);
              if (parsedTxn) break;
            }
        }
        if (!parsedTxn.meta) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        if (parsedTxn.meta.err !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const programAccount = parsedTxn.transaction.message.accountKeys.find(account => account.pubkey.toString() === PROGRAM_ID);
        if (!programAccount) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const admin = parsedTxn.transaction.message.accountKeys.find(account => account.signer && account.pubkey.toString() === ADMIN_WALLET.publicKey.toString());
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: UpdateBid'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
    
        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress,
                status: 1
            }
        })

        if (nftResult === null) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }
        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to ${mintAddress}`, data: null })
        }

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            name: accountInfo.name,
            image: accountInfo.image,
            type: ACTIVITY_TYPE.UPDATE_BID,
            price: offerPrice,
            from: bidderAddress,
            to: '',
            signature,
            status: 1,
        }
        await ActivityService.create(activity)

        const bidResult = await BidService.update({ offerPrice }, { where: { mintAddress, walletAddress: bidderAddress }, returning: true, plain: true })

        return res.status(200).json({ success: true, data: bidResult[1].dataValues, message: 'Success' })

    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const cancelBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress, signature } = req.body

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i ++) {
              await delay(INTERVAL);
              parsedTxn = await connection.getParsedTransaction(signature);
              if (parsedTxn) break;
            }
        }
        if (!parsedTxn.meta) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        if (parsedTxn.meta.err !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const programAccount = parsedTxn.transaction.message.accountKeys.find(account => account.pubkey.toString() === PROGRAM_ID);
        if (!programAccount) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const admin = parsedTxn.transaction.message.accountKeys.find(account => account.signer && account.pubkey.toString() === ADMIN_WALLET.publicKey.toString());
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: CancelBid'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress
            }
        })

        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to ${mintAddress}`, data: null })
        }

        const bidResult = await BidService.update({ status: 0 }, { where: { mintAddress, walletAddress: bidderAddress }, returning: true, plain: true })

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            name: accountInfo.name,
            image: accountInfo.image,
            type: ACTIVITY_TYPE.CANCEL_BID,
            price: bidResult[1].dataValues.offerPrice,
            from: bidderAddress,
            to: '',
            signature,
            status: 1,
        }
        await ActivityService.create(activity)
        return res.status(200).json({ success: true, data: bidResult[1].dataValues, message: 'Success' })

    } catch (err) {
        console.log('error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const acceptBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress, signature } = req.body

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i ++) {
              await delay(INTERVAL);
              parsedTxn = await connection.getParsedTransaction(signature);
              if (parsedTxn) break;
            }
        }

        if (!parsedTxn.meta) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        if (parsedTxn.meta.err !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        
        const programAccount = parsedTxn.transaction.message.accountKeys.find(account => account.pubkey.toString() === PROGRAM_ID);
        if (!programAccount) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const admin = parsedTxn.transaction.message.accountKeys.find(account => account.signer && account.pubkey.toString() === ADMIN_WALLET.publicKey.toString());
        if (!admin) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: AcceptBid'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })

        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress,
                status: 1
            }
        })

        if (nftResult === null) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to ${mintAddress}`, data: null })
        }

        const bidResult = await BidService.update({ status: 2 }, { where: { mintAddress, walletAddress: bidderAddress }, returning: true, plain: true })

        await NftService.update({ walletAddress: bidderAddress, status: 3 }, { where: { mintAddress } })

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            name: accountInfo.name,
            image: accountInfo.image,
            type: ACTIVITY_TYPE.ACCEPT_BID,
            price: bidResult[1].dataValues.offerPrice,
            from: nftResult.walletAddress,
            to: bidderAddress,
            signature,
            status: 1,
        }

        await ActivityService.create(activity)

        return res.status(200).json({ success: true, data: bidResult[1].dataValues, message: 'Success' })
    } catch (err) {
        console.log('accept bid error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthBidByNftAndWallet = async (req: Request, res: Response) => {
    try {
        const { contract, id, walletAddress } = req.body
        if (!contract || !id || !walletAddress) {
            return res.status(400).json(BAD_REQUEST)
        }

        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })

        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                collectionId: collection.id,
                nftId: id,
                walletAddress,
                status: 1
            }
        }
        const result = await BidService.findOne(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}


const getEthBidsByNFT = async (req: Request, res: Response) => {
    try {
        const { contract, id, limit, currentPage } = req.body
        if (!contract || !id|| !limit || !currentPage) {
            return res.status(400).json(BAD_REQUEST)
        }

        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })

        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            },
            order: [['updated_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }
        const result = await BidService.findAndCountAll(condition)
        res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthTopBidByNFT = async (req: Request, res: Response) => {
    try {
        const { contract, id } = req.body
        if (!contract || !id) {
            return res.status(400).json(BAD_REQUEST)
        }

        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })

        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            },
            order: [['offerPrice', 'DESC']]
        }

        const result = await BidService.findAll(condition)

        if (result === null) {
            return res.status(200).json({ success: true, data: null, message: 'Success' })
        }
        return res.status(200).json({ success: true, data: result[0], message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

// Make Bid Nft
const makeEthBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, contract, id, offerPrice, signature } = req.body

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })

        if (!collection) {
            return res.status(400).json({ success: false, message: BAD_REQUEST, data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            }
        })

        if (!nftResult) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                walletAddress: bidderAddress,
            }
        })
        let bidResult: any
        if (!oldBid) {
            const data = {
                image: nftResult.image,
                name: nftResult.name,
                collectionId: collection.id,
                nftId: id,
                walletAddress: bidderAddress,
                offerPrice,
                currentPrice: nftResult.price,
                status: 1
            }

            bidResult = await BidService.create(data)
        } else {
            if (oldBid.status === 2) {
                const data = {
                    walletAddress: bidderAddress,
                    offerPrice,
                    currentPrice: nftResult.price,
                    status: 1
                }
                const condition = {
                    where: {
                        collectionId: collection.id,
                        nftId: id,
                        walletAddress: bidderAddress
                    },
                    returning: true,
                    plain: true
                }
                bidResult = await NftService.update(data, condition)[1].dataValues
            }
        }

        const activity = {
            collectionId: nftResult.collectionId,
            nftId: id,
            image: nftResult.image,
            name: nftResult.name,
            type: ACTIVITY_TYPE.PLACED_BID,
            price: offerPrice,
            from: bidderAddress,
            to: '',
            signature,
            status: 1,
        }
        await ActivityService.create(activity)
        return res.status(200).json({ success: true, data: bidResult, message: 'Success' })

    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateEthBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, contract, id, offerPrice, signature } = req.body
        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }


        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })
        if (!collection) {
            return res.status(400).json({ success: false, message: BAD_REQUEST, data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            }
        })

        if (!nftResult) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }
        const oldBid = await BidService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (!oldBid) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to NFT`, data: null })
        }

        const activity = {
            collectionId: nftResult.collectionId,
            nftId: id,
            name: nftResult.name,
            image: nftResult.image,
            type: ACTIVITY_TYPE.UPDATE_BID,
            price: offerPrice,
            from: bidderAddress,
            to: '',
            signature,
            status: 1,
        }
        await ActivityService.create(activity)

        const bidResult = await BidService.update({ offerPrice }, { where: { collectionId: collection.id, nftId: id, walletAddress: bidderAddress }, returning: true, plain: true })

        return res.status(200).json({ success: true, data: bidResult[1].dataValues, message: 'Success' })

    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const cancelEthBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, contract, id, signature } = req.body

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })
        if (!collection) {
            return res.status(400).json({ success: false, message: BAD_REQUEST, data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            }
        })

        if (!nftResult) {
            return res.status(400).json({ success: false, message: BAD_REQUEST, data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                walletAddress: bidderAddress,
                status: 1
            }
        })

        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to NFT`, data: null })
        }

        const bidResult = await BidService.update({ status: 0 }, { where: { collectionId: collection.id, nftId: id, walletAddress: bidderAddress }, returning: true, plain: true })

        const activity = {
            collectionId: nftResult.collectionId,
            nftId: id,
            name: nftResult.name,
            image: nftResult.image,
            type: ACTIVITY_TYPE.CANCEL_BID,
            price: bidResult[1].dataValues.offerPrice,
            from: bidderAddress,
            to: '',
            signature,
            status: 1,
        }
        await ActivityService.create(activity)
        return res.status(200).json({ success: true, data: bidResult[1].dataValues, message: 'Success' })

    } catch (err) {
        console.log('error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const acceptEthBid = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, contract, id, signature } = req.body

        console.log('accept bid', bidderAddress, contract);
        if (!bidderAddress || !contract || !id || !signature) {
            return res.status(400).json({ success: false, message: BAD_REQUEST, data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })

        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
       
        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        })
        if (!collection) {
            return res.status(400).json({ success: false, message: BAD_REQUEST, data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            }
        })

        if (!nftResult) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                collectionId: collection.id,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (!oldBid) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to NFT`, data: null })
        }

        const bidResult = await BidService.update({ status: 2 }, { where: { collectionId: collection.id, nftId: id, walletAddress: bidderAddress }, returning: true, plain: true })

        await NftService.update({ walletAddress: bidderAddress, status: 3 }, { where: { collectionId: collection.id, nftId: id } })

        const activity = {
            collectionId: nftResult.collectionId,
            nftId: id,
            name: nftResult.name,
            image: nftResult.image,
            type: ACTIVITY_TYPE.ACCEPT_BID,
            price: bidResult[1].dataValues.offerPrice,
            from: nftResult.walletAddress,
            to: bidderAddress,
            signature,
            status: 1,
        }

        await ActivityService.create(activity)

        return res.status(200).json({ success: true, data: bidResult[1].dataValues, message: 'Success' })
    } catch (err) {
        console.log('accept bid error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

// Make Transaction
const makeBidTransaction = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress, offerPrice } = req.body

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress,
                status: 1
            }
        })

        if (nftResult === null) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const walletResult = await WalletService.findOne({ where: { walletAddress: bidderAddress } })

        let vault: any

        if (!walletResult) {
            vault = new Keypair()
            const encodedKey = bs58.encode(vault.secretKey)
            await WalletService.create({
                walletAddress: bidderAddress,
                vault: encodedKey
            })
        } else {
            vault = bs58.decode(walletResult.vault)
        }

        const tx = await makeBidTx(offerPrice, {
            bidder: new PublicKey(bidderAddress),
            seller: new PublicKey(nftResult.walletAddress),
            mint: new PublicKey(mintAddress),
            tokenAccount: new PublicKey(nftResult.tokenAccount),
            vault: Keypair.fromSecretKey(vault),
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.status(200).json({ success: true, data: { tx: seqTx }, message: 'Success' })

    } catch (err) {
        console.log('error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateBidTransaction = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress, offerPrice } = req.body

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress,
                status: 1
            }
        })

        if (nftResult === null) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to ${mintAddress}`, data: null })
        }

        const walletResult = await WalletService.findOne({ where: { walletAddress: bidderAddress } })

        let vault: any

        if (walletResult === null) {
            return res.status(400).json({ success: false, message: `Bad Request!`, data: null })
        }

        vault = bs58.decode(walletResult.vault)

        const tx = await makeUpdateBidTx(offerPrice, {
            bidder: new PublicKey(bidderAddress),
            seller: new PublicKey(nftResult.walletAddress),
            mint: new PublicKey(mintAddress),
            tokenAccount: new PublicKey(nftResult.tokenAccount),
            vault: Keypair.fromSecretKey(vault),
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.status(200).json({ success: true, data: { tx: seqTx }, message: 'Success' })

    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const cancelBidTransaction = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress } = req.body

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress
            }
        })

        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress
            }
        })
        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to ${mintAddress}`, data: null })
        }

        const walletResult = await WalletService.findOne({ where: { walletAddress: bidderAddress } })

        let vault: any

        if (walletResult === null) {
            return res.status(400).json({ success: false, message: `Bad Request!`, data: null })
        }

        vault = bs58.decode(walletResult.vault)

        const tx = await makeCancelBidTx({
            bidder: new PublicKey(bidderAddress),
            mint: new PublicKey(mintAddress),
            tokenAccount: new PublicKey(nftResult.tokenAccount),
            vault: Keypair.fromSecretKey(vault),
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.status(200).json({ success: true, data: { tx: seqTx }, message: 'Success' })

    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const acceptBidTransaction = async (req: Request, res: Response) => {
    try {
        let { bidderAddress, mintAddress } = req.body

        bidderAddress = await resolveToWalletAddress({ text: bidderAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        const accountInfo = await solanaClient.getCollectible(mintAddress)
        const nftNameArray = accountInfo.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        // validate nft
        const hash = await HashlistService.findOne({
            where: {
                nftName: nftName
            }
        })

        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress,
                status: 1
            }
        })

        if (nftResult === null) {
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const oldBid = await BidService.findOne({
            where: {
                mintAddress,
                walletAddress: bidderAddress,
                status: 1
            }
        })
        if (oldBid === null) {
            return res.status(400).json({ success: false, message: `${bidderAddress} does not bid to ${mintAddress}`, data: null })
        }

        const walletResult = await WalletService.findOne({ where: { walletAddress: bidderAddress } })

        let vault: any

        if (walletResult === null) {
            return res.status(400).json({ success: false, message: `Bad Request!`, data: null })
        }

        vault = bs58.decode(walletResult.vault)

        const tx = await makeAcceptBidTx({
            seller: new PublicKey(nftResult.walletAddress),
            bidder: new PublicKey(bidderAddress),
            mint: new PublicKey(mintAddress),
            tokenFrom: new PublicKey(nftResult.tokenAccount),
            vault: Keypair.fromSecretKey(vault),
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.status(200).json({ success: true, data: { tx: seqTx }, message: 'Success' })

    } catch (err) {
        console.log('accept bid controller error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}


// Admin Panel
const getData = async (req: Request, res: Response) => {
    try {
        const { params } = req.body

        if (params === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                [Op.or]: [
                    {
                        key: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    },
                    {
                        value: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    }
                ]
            },
            order: [[params.column, params.direction]],
            limit: params.rowsPerPage,
            offset: (params.currentPage - 1) * params.rowsPerPage
        }
        const result = await BidService.findAndCountAll(condition)

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const addEvent = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        delete data.id

        const result = await BidService.create(data)

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateEvent = async (req: Request, res: Response) => {
    try {
        const { data } = req.body

        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await BidService.update(data, { where: { id: data.id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const deleteEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        if (id === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await BidService.destroy({ where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    // User Panel
    getBidsByWallet,
    getBidByNftAndWallet,
    getBidsByNFT,
    getTopBidByNFT,
    getReceivedBids,
    makeBid,
    updateBid,
    cancelBid,
    acceptBid,
    makeBidTransaction,
    updateBidTransaction,
    cancelBidTransaction,
    acceptBidTransaction,
    getEthBidByNftAndWallet,
    getEthBidsByNFT,
    getEthTopBidByNFT,
    makeEthBid,
    updateEthBid,
    cancelEthBid,
    acceptEthBid,
    // Admin Panel
    getData,
    addEvent,
    updateEvent,
    deleteEvent,
}