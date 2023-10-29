import { Request, Response } from 'express'
import NftService from '../services/nft'
import ActivityService from '../services/activity'
import HashlistService from '../services/hashlist'
import CollectionService from '../services/collection'

import { BAD_REQUEST, BACKEND_ERROR, CLUSTER_API, PROGRAM_ID } from '../config'
import { ACTIVITY_TYPE } from "../constants"

import Sequelize from "sequelize"
const Op = Sequelize.Op

import {
    resolveToWalletAddress,
    getParsedAccountByMint,
} from "@nfteyez/sol-rayz"

import {
    makeListTx,
    makeUpdateListTx,
    makeCancelListTx,
    makeBuyTx,
} from "../helpers/contract"

import {
    makeEthListTx
} from "../helpers/contract/eth"

import { PublicKey, Connection, Keypair } from "@solana/web3.js"

import { SolanaClient } from '../helpers/solana'
import { INTERVAL, LOOP, KEYPAIR } from '../config/dev'
import { delay } from '../helpers/methods'
import { getNftInfo, getNftMetadata, getNftsByWallet } from '../helpers/ether'

const ADMIN_WALLET = Keypair.fromSeed(Uint8Array.from(KEYPAIR).slice(0, 32));
const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API })

const connection = new Connection(CLUSTER_API, 'confirmed')
// User Panel

const getMoreNFTsBySymbol = async (req: Request, res: Response) => {
    try {
        const { symbol, mintAddress } = req.body

        if (symbol === undefined || mintAddress === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition1 = {
            where: {
                symbol: symbol,
                status: 1
            }
        }

        let collection = await CollectionService.findOne(condition1)

        let nfts: any

        if (collection !== null) {

            const condition2 = {
                where: {
                    collectionId: collection.id,
                    mintAddress: {
                        [Op.ne]: mintAddress
                    },
                    status: 1
                },
                order: Sequelize.literal('random()'),
                limit: 10,
            }

            nfts = await NftService.findAll(condition2)
        }

        return res.status(200).json({ success: true, data: nfts, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getNftByWalletAddress = async (req: Request, res: Response) => {
    try {
        const { walletAddress, status } = req.params
        console.log('walletAddress', walletAddress)
        if (!walletAddress) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                walletAddress,
                status: status
            }
        }
        let result = await NftService.findAll(condition)
        for (let i = 0; i < result.length; i++) {
            if (!result[i].tokenAccount) {
                const collection = await CollectionService.findOne({
                    where: {
                        id: result[i].collectionId
                    }
                })
                if (collection) {
                    const data = await getNftInfo(collection.contract, result[i].nftId);
                    if (data) {
                        result[i] = {
                            ...result[i].dataValues,
                            ...data
                        };
                    }
                }
            }
        }
        return res.json({ success: true, message: 'Success', data: result })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getNftByMintAddress = async (req: Request, res: Response) => {
    try {
        const { mintAddress } = req.params
        if (mintAddress === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        console.log('mintAddress', mintAddress);
        const condition = {
            where: {
                mintAddress
            }
        }

        const result = await NftService.findOne(condition)
        return res.json({ success: true, message: 'Success', data: result })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getNftSaleGraph = async (req: Request, res: Response) => {
    try {
        const { mintAddress } = req.params
        if (!mintAddress) {
            return res.status(400).json(BAD_REQUEST)
        }
        const condition = {
            where: {
                mintAddress
            },
            type: {
                [Op.or]: [
                    ACTIVITY_TYPE.BUY,
                    ACTIVITY_TYPE.ACCEPT_BID
                ]
            },
            raw: true
        }
        const activities = await ActivityService.findAll(condition);
        console.log('activities', activities);
        let chart_sale = {
            values: [],
            timestamps: []
        };
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            chart_sale.values.push(activity.price);
            chart_sale.timestamps.push(new Date(activity.created_at).getTime());
        }

        return res.json({ success: true, message: 'Success', data: chart_sale })
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const buyNft = async (req: Request, res: Response) => {
    try {
        let { buyerAddress, mintAddress, signature } = req.body

        buyerAddress = await resolveToWalletAddress({ text: buyerAddress, connection })
        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i++) {
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

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: Buy'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

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

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            name: accountInfo.name,
            image: accountInfo.image,
            type: ACTIVITY_TYPE.BUY,
            price: nftResult.price,
            from: buyerAddress,
            to: nftResult.walletAddress,
            signature,
            status: 1,
        }
        await ActivityService.create(activity)

        const data = {
            walletAddress: buyerAddress,
            status: 3,
        }
        const result = await NftService.update(data, { where: { mintAddress: mintAddress }, returning: true, plain: true })
        return res.json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        console.log('error', err);
        res.send(err)
    }
}

const listNft = async (req: Request, res: Response) => {
    try {
        let { mintAddress, price, walletAddress, signature } = req.body

        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })
        // const signature = 'HCRM2YY6ejbdri6qJkjpeD84NuRFnzQusEeRaM3LUt2tAhXY3athgmwULRCXrKEmEDgdovusPdZp7yBXrtf66mQ'
        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i++) {
                await delay(INTERVAL);
                parsedTxn = await connection.getParsedTransaction(signature);
                if (parsedTxn) break;
            }
        }
        console.log('parsedTxn', parsedTxn);

        if (!parsedTxn.meta) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        if (parsedTxn.meta.err) {
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

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: List'));
        console.log('log', log);
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        console.log('oldActivity', oldActivity);
        if (oldActivity) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

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

        const nftInfo = await getParsedAccountByMint({ mintAddress: mintAddress, connection })
        const owner = nftInfo.account.data.parsed.info.owner

        if (nftResult === null) {

            const data = {
                mintAddress,
                walletAddress,
                tokenAccount: nftInfo.pubkey,
                collectionId: hash.collectionId,
                name: accountInfo.name,
                price,
                image: accountInfo.image,
                attributes: accountInfo.attributes,
                sellerFeeBasisPoints: accountInfo.sellerFeeBasisPoints,
                status: 1,
            }

            const result = await NftService.create(data)

            const activity = {
                collectionId: hash.collectionId,
                mintAddress,
                image: accountInfo.image,
                name: accountInfo.name,
                type: ACTIVITY_TYPE.LIST,
                price,
                from: '',
                to: owner,
                signature,
                status: 1,
            }

            await ActivityService.create(activity)

            return res.json({ success: true, data: result, message: 'Success' })
        } else {

            if (nftResult.status === 1) {
                return res.status(400).json({ success: false, message: 'NFT is already listed', data: null })
            }

            const activity = {
                collectionId: nftResult.collectionId,
                mintAddress,
                image: accountInfo.image,
                name: accountInfo.name,
                type: ACTIVITY_TYPE.LIST,
                price: price,
                from: '',
                to: owner,
                signature,
                status: 1,
            }

            await ActivityService.create(activity)

            const data = {
                price,
                walletAddress,
                tokenAccount: nftInfo.pubkey,
                status: 1,
            }

            const result = await NftService.update(data, { where: { mintAddress: mintAddress }, returning: true, plain: true })

            return res.json({ success: true, data: result, message: 'Success' })
        }

    } catch (err) {
        console.log('err', err);
        res.send(err)
    }
}

const updateNft = async (req: Request, res: Response) => {
    try {
        let { mintAddress, price, signature } = req.body

        mintAddress = await resolveToWalletAddress({ text: mintAddress, connection })

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i++) {
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

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: UpdateList'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

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

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            name: accountInfo.name,
            image: accountInfo.image,
            type: ACTIVITY_TYPE.UPDATE_LIST,
            price: price,
            from: '',
            to: nftResult.walletAddress,
            signature,
            status: 1,
        }
        await ActivityService.create(activity)

        const data = {
            price: price,
        }

        const result = await NftService.update(data, { where: { mintAddress: mintAddress }, returning: true, plain: true })
        return res.json({ success: true, data: result, message: 'Success' })

    } catch (err) {
        res.send(err)
    }
}

const unlistNft = async (req: Request, res: Response) => {
    try {
        let { mintAddress, signature } = req.body

        let parsedTxn = await connection.getParsedTransaction(signature)
        if (!parsedTxn) {
            for (let i = 0; i < LOOP; i++) {
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

        const log = parsedTxn.meta.logMessages.find(msg => msg.includes('Program log: Instruction: CancelList'));
        if (!log) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity !== null) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }

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

        const activity = {
            collectionId: nftResult.collectionId,
            mintAddress,
            name: accountInfo.name,
            image: accountInfo.image,
            type: ACTIVITY_TYPE.UNLIST,
            price: nftResult.price,
            from: '',
            to: nftResult.walletAddress,
            signature,
            status: 1,
        }

        await ActivityService.create(activity)

        const data = {
            status: 2,
        }

        const result = await NftService.update(data, { where: { mintAddress: mintAddress }, returning: true, plain: true })
        return res.json({ success: true, data: result, message: 'Success' })

    } catch (err) {
        res.send(err)
    }
}

const buyNftTransaction = async (req: Request, res: Response) => {
    try {
        let { buyerAddress, seller, mintAddress } = req.body

        buyerAddress = await resolveToWalletAddress({ text: buyerAddress, connection })
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

        const nftInfo = await getParsedAccountByMint({ mintAddress: mintAddress, connection })
        const owner = nftInfo.account.data.parsed.info.owner

        if (nftResult.tokenAccount !== nftInfo.pubkey.toString()) {
            // Cancel list logic
            return res.status(400).json({ success: false, message: 'NFT is not listed', data: null })
        }

        const tx = await makeBuyTx({
            buyer: new PublicKey(buyerAddress),
            seller: new PublicKey(seller),
            mint: new PublicKey(mintAddress),
            tokenFrom: new PublicKey(nftResult.tokenAccount)
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.json({ success: true, data: { tx: seqTx }, message: 'Success' })
    } catch (err) {
        res.send(err)
    }
}

const listNftTransaction = async (req: Request, res: Response) => {
    try {
        let { mintAddress, price } = req.body

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

        console.log('hash', hash);
        if (hash === null) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const validAddress = hash.hashlist.indexOf(mintAddress)

        console.log('validAddress', validAddress);
        if (validAddress === -1) {
            return res.status(400).json({ success: false, message: 'Collection Validate Error', data: null })
        }

        const nftInfo = await getParsedAccountByMint({ mintAddress: mintAddress, connection })

        const nftResult = await NftService.findOne({
            where: {
                mintAddress: mintAddress
            }
        })
        let tx: any
        const owner = nftInfo.account.data.parsed.info.owner

        if (!nftResult) {

            tx = await makeListTx(price, {
                user: new PublicKey(owner),
                mint: new PublicKey(mintAddress),
                tokenAccount: new PublicKey(nftInfo.pubkey)
            })

        } else {

            if (nftResult.status === 1) {
                return res.status(400).json({ success: false, message: 'NFT is already listed', data: null })
            }

            tx = await makeListTx(price, {
                user: new PublicKey(owner),
                mint: new PublicKey(mintAddress),
                tokenAccount: new PublicKey(nftInfo.pubkey)
            })
        }

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        console.log('seqTx', tx)
        return res.json({ success: true, data: { tx: seqTx }, message: 'Success' })
        // let tx1: any = anchor.web3.Transaction.populate(anchor.web3.Message.from(seqTx));
    } catch (err) {
        res.send(err)
    }
}

const updateNftTransaction = async (req: Request, res: Response) => {
    try {
        let { mintAddress, walletAddress, price } = req.body

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

        const nftInfo = await getParsedAccountByMint({ mintAddress: mintAddress, connection })

        const owner = nftInfo.account.data.parsed.info.owner
        const tx = await makeUpdateListTx(price, {
            user: new PublicKey(walletAddress),
            mint: new PublicKey(mintAddress),
            tokenAccount: new PublicKey(nftInfo.pubkey)
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.json({ success: true, data: { tx: seqTx }, message: 'Success' })

    } catch (err) {
        console.log('update list error', err);
        res.send(err)
    }
}

const unlistNftTransaction = async (req: Request, res: Response) => {
    try {
        let { walletAddress, mintAddress } = req.body

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

        const nftInfo = await getParsedAccountByMint({ mintAddress: mintAddress, connection })

        const owner = nftInfo.account.data.parsed.info.owner
        console.log('owner', owner.toString())
        console.log('tokenAccount', new PublicKey(nftInfo.pubkey).toString())

        const tx = await makeCancelListTx({
            user: new PublicKey(walletAddress),
            mint: new PublicKey(mintAddress),
            tokenAccount: new PublicKey(nftInfo.pubkey)
        })

        const seqTx = tx.serialize({ requireAllSignatures: false, verifySignatures: false })
        return res.json({ success: true, data: { tx: seqTx }, message: 'Success' })

    } catch (err) {
        res.send(err)
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
        const result = await NftService.findAndCountAll(condition)

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

        const result = await NftService.create(data)

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

        const result = await NftService.update(data, { where: { id: data.id } })

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

        const result = await NftService.destroy({ where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

export const getEthNftsByAddress = async (req, res) => {
    try {
        const { wallet } = req.params;
        const result = await getNftsByWallet(wallet);
        return res.status(200).json(result);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthNftSaleGraph = async (req: Request, res: Response) => {
    try {
        const { contract, id } = req.params
        if (!contract || !id) {
            return res.status(400).json(BAD_REQUEST)
        }
        const collection = await CollectionService.findOne({
            where: {
                contract
            }
        })
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }
        const condition = {
            where: {
                collectionId: collection.id,
                nftId: id
            },
            type: {
                [Op.or]: [
                    ACTIVITY_TYPE.BUY,
                    ACTIVITY_TYPE.ACCEPT_BID
                ]
            },
            raw: true
        }
        const activities = await ActivityService.findAll(condition);
        console.log('activities', activities);
        let chart_sale = {
            values: [],
            timestamps: []
        };
        for (let i = 0; i < activities.length; i++) {
            const activity = activities[i];
            chart_sale.values.push(activity.price);
            chart_sale.timestamps.push(new Date(activity.created_at).getTime());
        }

        return res.json({ success: true, message: 'Success', data: chart_sale })
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(BACKEND_ERROR)
    }
}

export const getEthNft = async (req, res) => {
    try {
        const { contract, id } = req.params;
        console.log('contract', contract, 'id', id);
        if (!contract || !id) return res.status(400).json(BAD_REQUEST);
        const collection = await CollectionService.findOne({
            where: {
                contract,
                status: 1
            }
        });
        console.log('collection', collection);
        if (!collection) return res.status(400).json(BAD_REQUEST);
        const nft = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id,
                status: 1
            }
        })
        console.log('nft', nft);
        const result = await getNftInfo(contract, id);
        if (nft) {
            return res.status(200).json({ nft, ...result });
        }
        return res.status(200).json(result);
    }
    catch (e) {
        console.log(e);
        return res.status(500).json(BACKEND_ERROR)
    }
}

export const listEthNft = async (req, res) => {
    try {
        const { contract, id, price, wallet, signature } = req.body;
        if (!contract || !id || !price || !signature) return res.status(400).json(BAD_REQUEST);
        const collection = await CollectionService.findOne({
            where: {
                chain: 1,
                contract
            }
        });

        if (!collection || collection.status !== 1) return res.status(400).json(BAD_REQUEST);

        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        const nftResult = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id
            }
        })
        const nftInfo = await getNftInfo(contract, id);
        const metadata = JSON.parse(nftInfo.metadata);
        if (!nftResult) {
            const data = {
                mintAddress: `${contract}${id}`,
                nftId: id,
                walletAddress: wallet,
                collectionId: collection.id,
                name: metadata?.name,
                price,
                image: metadata?.image,
                attributes: metadata?.attributes,
                sellerFeeBasisPoints: metadata?.sellerFeeBasisPoints,
                status: 1,
            }
            const result = await NftService.create(data)

            const activity = {
                collectionId: collection?.id,
                nftId: id,
                image: metadata.image,
                name: nftInfo.name ? nftInfo?.name : metadata?.name,
                type: ACTIVITY_TYPE.LIST,
                price,
                from: '',
                to: wallet,
                signature,
                status: 1,
            }

            await ActivityService.create(activity)

            return res.json({ success: true, data: result, message: 'Success' })
        } else {

            if (nftResult.status === 1) {
                return res.status(400).json({ success: false, message: 'NFT is already listed', data: null })
            }

            const activity = {
                collectionId: nftResult.collectionId,
                image: metadata.image,
                name: metadata.name,
                type: ACTIVITY_TYPE.LIST,
                nftId: id,
                price: price,
                from: '',
                to: wallet,
                signature,
                status: 1,
            }
            await ActivityService.create(activity)

            const data = {
                price,
                walletAddress: wallet,
                status: 1,
            }

            const result = await NftService.update(data, { where: { collectionId: collection?.id, nftId: id }, returning: true, plain: true })

            return res.json({ success: true, data: result, message: 'Success' })
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json(BACKEND_ERROR)
    }
}

export const unlistEthNft = async (req, res) => {
    try {
        const { contract, id, wallet, signature } = req.body;
        if (!contract || !id || !signature) return res.status(400).json(BAD_REQUEST);
        const collection = await CollectionService.findOne({
            where: {
                chain: 1,
                contract
            }
        });
        if (!collection || collection.status !== 1) return res.status(400).json(BAD_REQUEST);
        const oldActivity = await ActivityService.findOne({
            where: { signature }
        })
        if (oldActivity) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        }
        const nftResult = await NftService.findOne({
            where: {
                collectionId: collection.id,
                nftId: id
            }
        })

        console.log('nftResult', nftResult);
        const nftInfo = await getNftInfo(contract, id);
        const metadata = JSON.parse(nftInfo.metadata);
        console.log('nftInfo', nftInfo);
        if (!nftResult) {
            return res.status(400).json({ success: false, message: 'Transaction Error', data: null })
        } else {

            if (nftResult.status !== 1) {
                return res.status(400).json({ success: false, message: 'NFT is not valid', data: null })
            }

            const activity = {
                collectionId: nftResult.collectionId,
                image: metadata.image,
                name: metadata.name,
                type: ACTIVITY_TYPE.UNLIST,
                nftId: id,
                price: nftResult.price,
                from: '',
                to: '',
                signature,
                status: 1,
            }

            await ActivityService.create(activity)

            const data = {
                status: 2,
            }

            const result = await NftService.update(data, { where: { collectionId: collection?.id, nftId: id }, returning: true, plain: true })

            return res.json({ success: true, data: result, message: 'Success' })
        }
    }
    catch (e) {
        console.log(e);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const buyEthNft = async (req: Request, res: Response) => {
    try {
        let { buyerAddress, contract, id, signature } = req.body

        console.log('id', id);
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

        const activity = {
            collectionId: nftResult.collectionId,
            nftId: id,
            name: nftResult.name,
            image: nftResult.image,
            type: ACTIVITY_TYPE.BUY,
            price: nftResult.price,
            from: buyerAddress,
            to: nftResult.walletAddress,
            signature,
            status: 1,
        }
        await ActivityService.create(activity)

        const data = {
            walletAddress: buyerAddress,
            status: 3,
        }
        const result = await NftService.update(data, { where: { collectionId: collection.id, nftId: id }, returning: true, plain: true })
        return res.json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        console.log('error', err);
        res.send(err)
    }
}

const updateEthNft = async (req: Request, res: Response) => {
    try {
        let { contract, id, price, signature } = req.body
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

        const activity = {
            collectionId: nftResult.collectionId,
            nftId: id,
            name: nftResult.name,
            image: nftResult.image,
            type: ACTIVITY_TYPE.UPDATE_LIST,
            price: price,
            from: '',
            to: nftResult.walletAddress,
            signature,
            status: 1,
        }
        await ActivityService.create(activity)

        const data = {
            price: price,
        }

        const result = await NftService.update(data, { where: { collectionId: collection.id, nftId: id }, returning: true, plain: true })
        return res.json({ success: true, data: result, message: 'Success' })

    } catch (err) {
        res.send(err)
    }
}

export default {
    // User Panel
    getMoreNFTsBySymbol,
    getNftByWalletAddress,
    getNftByMintAddress,
    getNftSaleGraph,
    buyNft,
    listNft,
    unlistNft,
    updateNft,
    buyNftTransaction,
    listNftTransaction,
    unlistNftTransaction,
    updateNftTransaction,
    getEthNftsByAddress,
    getEthNftSaleGraph,
    getEthNft,
    listEthNft,
    unlistEthNft,
    buyEthNft,
    updateEthNft,
    // Admin Panel
    getData,
    addEvent,
    updateEvent,
    deleteEvent,
}