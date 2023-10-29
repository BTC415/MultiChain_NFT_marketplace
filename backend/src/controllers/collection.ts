import { Request, Response } from 'express'
import { HTTP_STATUS_CODE } from "../constants/httpStatusCode"
import CollectionService from '../services/collection'
import NftService from '../services/nft'
import HashlistService from '../services/hashlist'
import ActivityService from '../services/activity'
import { getFormattedResponse } from "../utils"

import { BAD_REQUEST, BACKEND_ERROR, ETH } from '../config'

import fs from 'fs'
import { UploadedFile } from 'express-fileupload'

import moment from 'moment'

import Sequelize from "sequelize"
const Op = Sequelize.Op

import { CLUSTER_API, MAX_PRICE } from '../config'

import { getMintAddress } from "../helpers/web3/candyMachine"

import { METADATA_REPLACE, SolanaClient } from '../helpers/solana'
const solanaClient = new SolanaClient({ rpcEndpoint: CLUSTER_API })

import { decodeTokenMetadata, getParsedAccountByMint, getSolanaMetadataAddress } from '@nfteyez/sol-rayz'

import { Connection, PublicKey } from "@solana/web3.js"
import { ACTIVITY_TYPE, RECENT_TRADE_DAY, TOP_COLLECTION_HOLDER_COUNT } from '../constants'
import { calcFloorPrice } from '../helpers'
import { getCollectionInfo, getCollectionsByWallet, getHolders } from '../helpers/ether'
import axios from 'axios'
import { getHolder } from '../helpers/solana/connection'
const connection = new Connection(CLUSTER_API, 'confirmed')

// User Panel
const getPopularCollections = async (req: Request, res: Response) => {
    try {
        const { day } = req.query

        let condition: any
        if (day === undefined) {
            condition = {
                where: {
                    isPopular: true,
                    status: 1
                },
                limit: 10
            }
        } else {
            condition = {
                where: {
                    updated_at: {
                        [Op.gte]: moment().subtract(Number(day), 'days').toDate()
                    },
                    isPopular: true,
                    status: 1
                },
                limit: 10
            }
        }

        const result = await CollectionService.findAndCountAll(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAllCollections = async (req: Request, res: Response) => {
    try {
        console.log('get collections')
        let { search } = req.params

        if (search === undefined) {
            search = ''
        }

        const condition = {
            where: {
                [Op.or]: [
                    {
                        name: {
                            [Op.like]: `%${search}%`
                        }
                    },
                    {
                        symbol: {
                            [Op.like]: `%${search}%`
                        }
                    },
                ],
                status: 1,
            }
        }
        const result = await CollectionService.findAndCountAll(condition)
        return res.status(HTTP_STATUS_CODE.OK).json(getFormattedResponse(result, req.method))
        // return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        console.log('error', err)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getCollectionOneBySymbol = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params

        if (symbol === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                symbol: symbol,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)

        if (collection === null) {
            return res.status(500).json({ success: true, data: null, message: 'Collection is not exist!' })
        }

        let holders = []
        if (collection?.chain === 0) {
            const condition2 = { where: { collectionId: collection.id } }
    
            const { hashlist } = await HashlistService.findOne(condition2)
    
            const hashlistWithOwner = await Promise.all(
                hashlist.map(async (mintAddress: any, index: any) => getParsedAccountByMint({ mintAddress, connection }))
            )
    
    
            hashlistWithOwner.map((temp: any, index: any) => {
                const owner = temp.account.data.parsed.info.owner
                const fIndex = holders.findIndex(holder => holder.wallet === owner)
                if (fIndex >= 0) {
                    holders[fIndex].owns += 1
                } else {
                    const newHolder = { wallet: owner, owns: 1 }
                    holders.push(newHolder)
                }
            })
        }
        else {
            holders = await getHolders(collection.contract);
        }

        console.log('collection id', collection.id);
        const nftCondition = {
            where: {
                collectionId: collection.id,
                status: 1
            },
            attributes: [
                [Sequelize.fn('min', Sequelize.col('price')), 'minPrice'],
                [Sequelize.fn('max', Sequelize.col('price')), 'maxPrice'],
                [Sequelize.fn('count', Sequelize.col('price')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume']
            ],
            raw: true
        }
        const nftStatistic = await NftService.findAll(nftCondition)
        console.log('nftStatistic', nftStatistic);
        const activityCondition1 = {
            where: {
                collectionId: collection.id,
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                status: 1
            },
            attributes: [
                [Sequelize.fn('count', Sequelize.col('price')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const activityCondition2 = {
            where: {
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days').toDate()
                },
                collectionId: collection.id,
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                status: 1
            },
            attributes: [
                [Sequelize.fn('count', Sequelize.col('price')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }
        const activityCondition3 = {
            where: {
                created_at: {
                    [Op.and]: [
                        {[Op.lte]: moment().subtract(1, 'days').toDate()},
                        {[Op.gte]: moment().subtract(2, 'days').toDate()},
                    ] 
                },
                collectionId: collection.id,
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                status: 1
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const activityStatistic1 = await ActivityService.findAll(activityCondition1)
        const activityStatistic2 = await ActivityService.findAll(activityCondition2)
        const activityStatistic3 = await ActivityService.findAll(activityCondition3)
        console.log('activityStatistic3', activityCondition3, activityStatistic3);
        const result = {
            ...collection.dataValues,
            minPrice: nftStatistic[0].minPrice,
            maxPrice: nftStatistic[0].maxPrice,
            floorPrice: nftStatistic[0].minPrice,
            totalVolume: activityStatistic1[0].totalVolume,
            avgSalePrice: activityStatistic1[0].count === '0' ? 0 : (activityStatistic1[0].totalVolume / Number(activityStatistic1[0].count)).toFixed(2),
            purchased: Number(activityStatistic1[0].count),
            purchased24h: Number(activityStatistic2[0].count),
            volume24h: Number(activityStatistic2[0].totalVolume),
            percent24h: Number(activityStatistic3[0].totalVolume) === 0 ? 0 :
             (Number(activityStatistic2[0].totalVolume) - Number(activityStatistic3[0].totalVolume)) / Number(activityStatistic3[0].totalVolume) * 100,
            listedCount: Number(nftStatistic[0].count),
            uniqueHolders: holders.length
        }

        return res.status(HTTP_STATUS_CODE.OK).json(getFormattedResponse(result, req.method))
        // return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

// Pagnation 
const getCollectionBySymbol = async (req: Request, res: Response) => {
    try {
        const { symbol, price, sort, attributes, offset, limit, search } = req.body
        console.log('symbol', symbol);
        const condition1 = {
            where: {
                symbol: symbol,
                status: 1
            }
        }

        let collection = await CollectionService.findOne(condition1)
        console.log('collection', collection);
        let nfts: any

        if (collection !== null) {

            let orderBy: string, sortType: string

            switch (sort) {
                case 'recent': {
                    orderBy = 'updated_at'
                    sortType = 'DESC'
                }
                    break
                case 'price_low_to_high': {
                    orderBy = 'price'
                    sortType = 'ASC'
                }
                    break
                case 'price_high_to_low': {
                    orderBy = 'price'
                    sortType = 'DESC'
                }
                    break
            }

            let filters = {
                [Op.and]: []
            }
            if (attributes) {

                attributes?.map((attr: any, index: any) => {
                    let filter = {
                        [Op.or]: []
                    }
                    attr.value.map((val: any, index: any) => {
                        filter[Op.or].push(
                            {
                                attributes: {
                                    [Op.contains]: [{
                                        "trait_type": attr.trait_type,
                                        "value": val
                                    }]
                                }
                            }
                        )
                    })
                    filters[Op.and].push(filter)
                })
            }

            let condition2: any = {
                where: {
                    collectionId: collection.id,
                    status: 1,
                    ...filters
                }
            }

            if (price) {
                condition2 = {
                    ...condition2,
                    where: {
                        ...condition2.where,
                        price: {
                            [Op.gte]: price?.min,
                            [Op.lte]: price?.max
                        },
                        
                    }

                }
            }

            if (search) {
                condition2 = {
                    ...condition2,
                    where: {
                        ...condition2.where,
                        name: {
                            [Op.like]: `%${search}%`
                        },
                    }

                }
            }

            if (limit && offset) {
                condition2 = {
                    ...condition2,
                    limit: limit,
                    offset: offset
                }
            }

            if (orderBy && sortType) {
                condition2 = {
                    ...condition2,
                    order: [[orderBy, sortType]]
                }
            }
            nfts = await NftService.findAndCountAll(condition2)

        }

        return res.status(200).json({ success: true, data: { collection, nfts }, message: 'Success' })

    } catch (err) {
        console.log('error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAnalytics = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.body

        if (symbol === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition1 = { where: { symbol: symbol, status: 1 } }

        const collection = await CollectionService.findOne(condition1)

        if (collection === null) {
            return res.status(500).json({ success: true, data: null, message: 'Collection is not exist!' })
        }

        const condition2 = { where: { collectionId: collection.id } }

        const { hashlist } = await HashlistService.findOne(condition2)

        const hashlistWithOwner = await Promise.all(
            hashlist.map(async (mintAddress: any, index: any) => getParsedAccountByMint({ mintAddress, connection }))
        )

        let holders = []

        hashlistWithOwner.map((temp: any, index: any) => {
            const owner = temp.account.data.parsed.info.owner
            const fIndex = holders.findIndex(holder => holder.wallet === owner)
            if (fIndex >= 0) {
                holders[fIndex].owns += 1
            } else {
                const newHolder = { wallet: owner, owns: 1 }
                holders.push(newHolder)
            }
        })

        holders = holders.sort((a, b) => (a.owns > b.owns) ? -1 : ((b.owns > a.owns) ? 1 : 0))

        let tokenHolders = [
            0, // 1
            0, // 2-5
            0, // 6-24
            0, // 25-50
            0, // 51 ~
        ]

        const holderRanking = []

        holders.map(holder => {
            if (holder.owns > 50) {
                tokenHolders[4]++
            } else if (holder.owns > 24) {
                tokenHolders[3]++
            } else if (holder.owns > 5) {
                tokenHolders[2]++
            } else if (holder.owns > 1) {
                tokenHolders[1]++
            } else if (holder.owns > 0) {
                tokenHolders[0]++
            }

            holderRanking.push(
                {
                    ...holder,
                    supply: Math.ceil(Number((holder.owns / collection.totalSupply * 1000))) / 10
                }
            )
        })

        const statistics = {
            totalSupply: collection.totalSupply,
            holders: holders.length,
            avgOwned: Math.ceil(Number((holders.length / collection.totalSupply * 1000))) / 10,
            uniqueHolders: Math.ceil(Number((holders.length / collection.totalSupply * 100)))
        }

        return res.status(200).json({ success: true, data: { holderRanking, tokenHolders, statistics }, message: 'Success' })

    } catch (err) {
        console.log(err)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getMarketGraph = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params

        if (!symbol) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                symbol: symbol,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)

        const activityCondition = {
            where: {
                collectionId: collection.id,
                type: {
                    [Op.or]: [
                        ACTIVITY_TYPE.LIST, 
                        ACTIVITY_TYPE.UNLIST, 
                        ACTIVITY_TYPE.BUY, 
                        ACTIVITY_TYPE.ACCEPT_BID
                    ]
                },
            },
            raw: true
        }
        const activities = await ActivityService.findAll(activityCondition);

        let prices: any[] = [];
        let index = -1;
        let chart_floor = {
            values: [],
            timestamps: []
        }
        let chart_listing = {
            values: [],
            timestamps: []
        };
        let chart_volume = {
            values: [],
            timestamps: []
        };
        let oldFloor, newFloor;
        for (let i = 0; i < activities.length; i ++) {
            const activity = activities[i];
            switch(activity.type) {
                case ACTIVITY_TYPE.LIST:
                    index = prices.findIndex((item) => item.price === activity.price);
                    if (index >= 0) prices[index].count += 1;
                    else prices.push({price: activity.price, count: 1});

                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }

                    chart_listing.values.push(
                        chart_listing.values.length === 0 ? 1 :
                        chart_listing.values[chart_listing.values.length - 1] + 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())
                    break;
                case ACTIVITY_TYPE.UNLIST:
                    index = prices.findIndex((item) => item.price === activity.price && item.count > 0);
                    if (index >= 0) prices[index].count -= 1;
                    
                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }

                    chart_listing.values.push(
                        chart_listing.values[chart_listing.values.length - 1] - 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())
                    break;
                case ACTIVITY_TYPE.BUY:
                    index = prices.findIndex((item) => item.price === activity.price && item.count > 0);
                    if (index >= 0) prices[index].count -= 1;

                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }


                    chart_listing.values.push(
                        chart_listing.values[chart_listing.values.length - 1] - 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())

                    chart_volume.values.push(activity.price);
                    chart_volume.timestamps.push(new Date(activity.created_at).getTime());
                    break;
                case ACTIVITY_TYPE.ACCEPT_BID: 
                    index = prices.findIndex((item) => item.price === activity.price && item.count > 0);
                    if (index >= 0) prices[index].count -= 1;

                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }

                    chart_listing.values.push(
                        chart_listing.values[chart_listing.values.length - 1] - 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())

                    chart_volume.values.push(activity.price);
                    chart_volume.timestamps.push(new Date(activity.created_at).getTime());
                    break;
            }
        }

        let timestamps = [
            ...chart_floor.timestamps,
            ...chart_listing.timestamps,
            ...chart_volume.timestamps
        ].sort((a, b) => a - b)
        console.log('timestamps', timestamps);

        let floorValues: number[] = [], listingValues: number[] = [], volumeValues: number[] = [];

        for (let i = 0; i < timestamps.length; i ++) {
            const timestamp = timestamps[i];
            const floorIndex = chart_floor.timestamps.findIndex((item) => item === timestamp);
            if (floorIndex >= 0) floorValues.push(chart_floor.values[floorIndex]);
            else if (i === 0) floorValues.push(0);
            else floorValues.push(floorValues[i - 1]);

            const listingIndex = chart_listing.timestamps.findIndex((item) => item === timestamp);
            if (listingIndex >= 0) listingValues.push(chart_listing.values[listingIndex]);
            else if (i === 0) listingValues.push(0);
            else listingValues.push(listingValues[i - 1]);

            const volumeIndex = chart_volume.timestamps.findIndex((item) => item === timestamp);
            if (volumeIndex >= 0) volumeValues.push(chart_volume.values[volumeIndex]);
            else if (i === 0) volumeValues.push(0);
            else volumeValues.push(volumeValues[i - 1]);
        }

        return res.status(200).json({ success: true, data: {
                floorValues,
                listingValues,
                volumeValues,
                timestamps
        }});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getRecentTrades = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params

        if (!symbol) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                symbol: symbol,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition);
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const activityCondition = {
            where: {
                created_at: {
                    [Op.gte]: moment().subtract(RECENT_TRADE_DAY, 'days').toDate()
                },
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                collectionId: collection.id,
                status: 1
            },
            raw: true
        }

        const activities = await ActivityService.findAll(activityCondition);

        return res.status(200).json({ success: true, data: {
            activities
        }});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAttributes = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params

        if (!symbol) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                symbol: symbol,
                status: 1,
            }
        }

        let collection = await CollectionService.findOne(condition);
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        let attributes: any[] = []

        if (collection.attributes) {
            attributes = collection.attributes;
        }
        else {

            const hashlist = await HashlistService.findOne({
                where: {
                    collectionId: collection.id
                }
            })
            if (!hashlist) {
                return res.status(400).json(BAD_REQUEST)
            }
    
            let uris: string[] = [];
            for (let i = 0 ; i < hashlist.hashlist.length; i ++) {
                try {
                    const mint = hashlist.hashlist[i];
                    const metadataAddr = await getSolanaMetadataAddress(new PublicKey(mint));
                    const metadataInfo = await connection.getAccountInfo(metadataAddr);
                    const metadata = await decodeTokenMetadata(metadataInfo.data);
                    console.log('uri', metadata.data.uri)
                    uris.push(metadata.data.uri.replace(METADATA_REPLACE, ''));
                }
                catch (error) {
                    
                }
            }
            console.log('uris', uris);
            let metadataList = await Promise.all(
                uris.map(uri => axios.get(uri).then(data => data.data).catch(err => console.log('err', err)))
            );
            metadataList = metadataList.filter((data) => data);
    
            for (let i = 0 ; i < metadataList.length; i ++) {
                for (let j = 0; j < metadataList[i].attributes.length; j ++) {
                    const attribute = metadataList[i].attributes[j];
                    const index = attributes.findIndex((item: any) => item.type === attribute.trait_type && item.value === attribute.value);
                    if (index >= 0) attributes[index].count += 1;
                    else attributes.push({
                        type: attribute.trait_type,
                        value: attribute.value,
                        count: 1
                    })
                }
            }
            attributes = attributes.map((item) => ({
                ...item,
                percent: item.count / hashlist.hashlist.length * 100
            }))
            console.log('attributes', attributes);
            
            collection.attributes = attributes;
            await collection.save();
        }

        const nfts = await NftService.findAll({
            where: {
                collectionId: collection.id,
                status: 1
            }
        });

        attributes = attributes.map((item: any) => {
            const filteredNfts = nfts.filter((nft: any) => nft.attributes.find((attribute: any) => item.type === attribute.trait_type && item.value === attribute.value));
            let minPrice: any = null;
            if (filteredNfts.length > 0) {
                minPrice = filteredNfts[0].price;
                for (let i = 1 ; i < filteredNfts.length; i ++) {
                    if (filteredNfts[i].price < minPrice) minPrice = filteredNfts[i].price;
                }
            }

            return {
                ...item,
                minPrice
            }
        })
        return res.status(200).json({ success: true, data: {
            attributes
        }});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getTopHolders = async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params

        if (!symbol) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                symbol: symbol,
                status: 1,
            }
        }

        let collection = await CollectionService.findOne(condition);
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const hashlist = await HashlistService.findOne({
            where: {
                collectionId: collection.id
            }
        });

        const holders = await Promise.all(hashlist.hashlist.map((hash) => 
            getHolder(connection, new PublicKey(hash))
            .then(data => data)
            .catch(error => console.log('error', error))
        ));

        let holderCounts: any[] = [];

        for (let i = 0; i < holders.length; i ++) {
            const holder = holders[i];
            if (!holder) continue;

            const index = holderCounts.findIndex((item: any) => item.holder === holder);
            if (index >= 0) holderCounts[index].count += 1;
            else holderCounts.push({
                holder,
                count: 1
            })
        }
        holderCounts = holderCounts.sort((a: any, b: any) => b.count - a.count)
        .filter((_item: any, index: number) => index < TOP_COLLECTION_HOLDER_COUNT);
        // get collection floor price
        const nftCondition = {
            where: {
                collectionId: collection.id,
                status: 1
            },
            attributes: [
                [Sequelize.fn('min', Sequelize.col('price')), 'minPrice']
            ],
            raw: true
        }
        const nftStatistic = await NftService.findAll(nftCondition);
        const floorPrice = nftStatistic[0]?.minPrice || 0;

        for (let i = 0; i < holderCounts.length; i ++) {
            const result = await NftService.findAll({
                where: {
                    walletAddress: holderCounts[i].holder,
                    collectionId: collection.id,
                    status: 1
                }
            })
            holderCounts[i] = {
                ...holderCounts[i],
                listedCount: result.length,
                percent: holderCounts[i].count / collection.totalSupply * 100,
                totalValue: floorPrice * holderCounts[i].count
            }
        }

        return res.status(200).json({ success: true, data: holderCounts});
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(BACKEND_ERROR);
    }
}

export const getListDistribution =async (req: Request, res: Response) => {
    try {
        const { symbol } = req.params

        if (!symbol) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                symbol: symbol,
                status: 1,
            }
        }

        let collection = await CollectionService.findOne(condition);
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const nftCondition = {
            where: {
                collectionId: collection.id,
                status: 1
            },
            attributes: [
                [Sequelize.fn('min', Sequelize.col('price')), 'minPrice'],
                [Sequelize.fn('max', Sequelize.col('price')), 'maxPrice']
            ],
            raw: true
        }
        const nftStatistic = await NftService.findAll(nftCondition);
        const minPrice = nftStatistic[0]?.minPrice;
        const maxPrice = nftStatistic[0]?.maxPrice;
        const nfts = await NftService.findAll({
            where: {
                collectionId: collection.id,
                status: 1
            }
        });

        let distributions = [
            {
                startPercent: 0,
                startValue: 0,
                endPercent: 5,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 5,
                count: 0
            },
            {
                startPercent: 5,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 5,
                endPercent: 10,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 10,
                count: 0
            },
            {
                startPercent: 10,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 10,
                endPercent: 15,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 15,
                count: 0
            },
            {
                startPercent: 15,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 15,
                endPercent: 20,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 20,
                count: 0
            },
            {
                startPercent: 20,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 20,
                endPercent: 30,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 30,
                count: 0
            },
            {
                startPercent: 30,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 30,
                endPercent: 40,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 40,
                count: 0
            },
            {
                startPercent: 40,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 40,
                endPercent: 50,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 50,
                count: 0
            },
            {
                startPercent: 50,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 50,
                endPercent: 75,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 75,
                count: 0
            },
            {
                startPercent: 75,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 75,
                endPercent: 100,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 100,
                count: 0
            }
        ]

        for (let i = 0 ; i < nfts.length; i ++) {
            const nft = nfts[i];
            const index = distributions.findIndex(
                (item: any) => nft.price > item.startValue && nft.price <= item.endValue
            );
            if (index >= 0) distributions[index].count += 1;
        }

        return res.status(200).json({ success: true, data: distributions});
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(BACKEND_ERROR);
    }
} 
// eth
const getEthCollectionByAddress = async (req: Request, res: Response) => {
    try {
        const { wallet } = req.params
        const result = await getCollectionsByWallet(wallet);
        return res.status(200).json(result);
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getCollectionOneByContract = async (req: Request, res: Response) => {
    try {
        const { contract } = req.params
        console.log('contract', contract);
        if (!contract) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                contract: contract,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)

        if (!collection) {
            return res.status(500).json({ success: true, data: null, message: 'Collection is not exist!' })
        }

        let holders = []
        holders = await getHolders(collection.contract);

        const nftCondition = {
            where: {
                collectionId: collection.id,
                status: 1
            },
            attributes: [
                [Sequelize.fn('min', Sequelize.col('price')), 'minPrice'],
                [Sequelize.fn('max', Sequelize.col('price')), 'maxPrice'],
                [Sequelize.fn('count', Sequelize.col('price')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume']
            ],
            raw: true
        }
        const nftStatistic = await NftService.findAll(nftCondition)
        console.log('nftStatistic', nftStatistic);
        const activityCondition1 = {
            where: {
                collectionId: collection.id,
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                status: 1
            },
            attributes: [
                [Sequelize.fn('count', Sequelize.col('price')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const activityCondition2 = {
            where: {
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days').toDate()
                },
                collectionId: collection.id,
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                status: 1
            },
            attributes: [
                [Sequelize.fn('count', Sequelize.col('price')), 'count'],
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }
        const activityCondition3 = {
            where: {
                created_at: {
                    [Op.and]: [
                        {[Op.lte]: moment().subtract(1, 'days').toDate()},
                        {[Op.gte]: moment().subtract(2, 'days').toDate()},
                    ] 
                },
                collectionId: collection.id,
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                status: 1
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const activityStatistic1 = await ActivityService.findAll(activityCondition1)
        const activityStatistic2 = await ActivityService.findAll(activityCondition2)
        const activityStatistic3 = await ActivityService.findAll(activityCondition3)
        console.log('activityStatistic3', activityCondition3, activityStatistic3);
        const result = {
            ...collection.dataValues,
            minPrice: nftStatistic[0].minPrice,
            maxPrice: nftStatistic[0].maxPrice,
            floorPrice: nftStatistic[0].minPrice,
            totalVolume: activityStatistic1[0].totalVolume,
            avgSalePrice: activityStatistic1[0].count === '0' ? 0 : (activityStatistic1[0].totalVolume / Number(activityStatistic1[0].count)).toFixed(2),
            purchased: Number(activityStatistic1[0].count),
            purchased24h: Number(activityStatistic2[0].count),
            volume24h: Number(activityStatistic2[0].totalVolume),
            percent24h: Number(activityStatistic3[0].totalVolume) === 0 ? 0 :
             (Number(activityStatistic2[0].totalVolume) - Number(activityStatistic3[0].totalVolume)) / Number(activityStatistic3[0].totalVolume) * 100,
            listedCount: Number(nftStatistic[0].count),
            uniqueHolders: holders.length
        }

        return res.status(HTTP_STATUS_CODE.OK).json(getFormattedResponse(result, req.method))
        // return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getCollectionByContract = async (req: Request, res: Response) => {
    try {
        const { contract, price, sort, attributes, offset, limit, search } = req.body
        console.log('contract', contract);
        const condition1 = {
            where: {
                contract: contract,
                status: 1
            }
        }

        let collection = await CollectionService.findOne(condition1)
        console.log('collection', collection);
        let nfts: any

        if (collection !== null) {

            let orderBy: string, sortType: string

            switch (sort) {
                case 'recent': {
                    orderBy = 'updated_at'
                    sortType = 'DESC'
                }
                    break
                case 'price_low_to_high': {
                    orderBy = 'price'
                    sortType = 'ASC'
                }
                    break
                case 'price_high_to_low': {
                    orderBy = 'price'
                    sortType = 'DESC'
                }
                    break
            }

            let filters = {
                [Op.and]: []
            }
            if (attributes) {

                attributes?.map((attr: any, index: any) => {
                    let filter = {
                        [Op.or]: []
                    }
                    attr.value.map((val: any, index: any) => {
                        filter[Op.or].push(
                            {
                                attributes: {
                                    [Op.contains]: [{
                                        "trait_type": attr.trait_type,
                                        "value": val
                                    }]
                                }
                            }
                        )
                    })
                    filters[Op.and].push(filter)
                })
            }

            let condition2: any = {
                where: {
                    collectionId: collection.id,
                    status: 1,
                    ...filters
                }
            }

            if (price) {
                condition2 = {
                    ...condition2,
                    where: {
                        ...condition2.where,
                        price: {
                            [Op.gte]: price?.min,
                            [Op.lte]: price?.max
                        },
                        
                    }

                }
            }

            if (search) {
                condition2 = {
                    ...condition2,
                    where: {
                        ...condition2.where,
                        name: {
                            [Op.like]: `%${search}%`
                        },
                    }

                }
            }

            if (limit && offset) {
                condition2 = {
                    ...condition2,
                    limit: limit,
                    offset: offset
                }
            }

            if (orderBy && sortType) {
                condition2 = {
                    ...condition2,
                    order: [[orderBy, sortType]]
                }
            }
            nfts = await NftService.findAndCountAll(condition2)

        }

        return res.status(200).json({ success: true, data: { collection, nfts }, message: 'Success' })

    } catch (err) {
        console.log('error', err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthMarketGraph = async (req: Request, res: Response) => {
    try {
        const { contract } = req.params

        if (!contract) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                contract,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)

        const activityCondition = {
            where: {
                collectionId: collection.id,
                type: {
                    [Op.or]: [
                        ACTIVITY_TYPE.LIST, 
                        ACTIVITY_TYPE.UNLIST, 
                        ACTIVITY_TYPE.BUY, 
                        ACTIVITY_TYPE.ACCEPT_BID
                    ]
                },
            },
            raw: true
        }
        const activities = await ActivityService.findAll(activityCondition);

        let prices: any[] = [];
        let index = -1;
        let chart_floor = {
            values: [],
            timestamps: []
        }
        let chart_listing = {
            values: [],
            timestamps: []
        };
        let chart_volume = {
            values: [],
            timestamps: []
        };
        let oldFloor, newFloor;
        for (let i = 0; i < activities.length; i ++) {
            const activity = activities[i];
            switch(activity.type) {
                case ACTIVITY_TYPE.LIST:
                    index = prices.findIndex((item) => item.price === activity.price);
                    if (index >= 0) prices[index].count += 1;
                    else prices.push({price: activity.price, count: 1});

                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }

                    chart_listing.values.push(
                        chart_listing.values.length === 0 ? 1 :
                        chart_listing.values[chart_listing.values.length - 1] + 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())
                    break;
                case ACTIVITY_TYPE.UNLIST:
                    index = prices.findIndex((item) => item.price === activity.price && item.count > 0);
                    if (index >= 0) prices[index].count -= 1;
                    
                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }

                    chart_listing.values.push(
                        chart_listing.values[chart_listing.values.length - 1] - 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())
                    break;
                case ACTIVITY_TYPE.BUY:
                    index = prices.findIndex((item) => item.price === activity.price && item.count > 0);
                    if (index >= 0) prices[index].count -= 1;

                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }


                    chart_listing.values.push(
                        chart_listing.values[chart_listing.values.length - 1] - 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())

                    chart_volume.values.push(activity.price);
                    chart_volume.timestamps.push(new Date(activity.created_at).getTime());
                    break;
                case ACTIVITY_TYPE.ACCEPT_BID: 
                    index = prices.findIndex((item) => item.price === activity.price && item.count > 0);
                    if (index >= 0) prices[index].count -= 1;

                    oldFloor = chart_floor.values.length === 0 ? MAX_PRICE: 
                    chart_floor.values[chart_floor.values.length - 1]
                    newFloor = calcFloorPrice(oldFloor, prices);
                    if (newFloor !== oldFloor) {
                        chart_floor.values.push(newFloor);
                        chart_floor.timestamps.push(new Date(activity.created_at).getTime());
                    }

                    chart_listing.values.push(
                        chart_listing.values[chart_listing.values.length - 1] - 1
                    )
                    chart_listing.timestamps.push(new Date(activity.created_at).getTime())

                    chart_volume.values.push(activity.price);
                    chart_volume.timestamps.push(new Date(activity.created_at).getTime());
                    break;
            }
        }

        let timestamps = [
            ...chart_floor.timestamps,
            ...chart_listing.timestamps,
            ...chart_volume.timestamps
        ].sort((a, b) => a - b)
        console.log('timestamps', timestamps);

        let floorValues: number[] = [], listingValues: number[] = [], volumeValues: number[] = [];

        for (let i = 0; i < timestamps.length; i ++) {
            const timestamp = timestamps[i];
            const floorIndex = chart_floor.timestamps.findIndex((item) => item === timestamp);
            if (floorIndex >= 0) floorValues.push(chart_floor.values[floorIndex]);
            else if (i === 0) floorValues.push(0);
            else floorValues.push(floorValues[i - 1]);

            const listingIndex = chart_listing.timestamps.findIndex((item) => item === timestamp);
            if (listingIndex >= 0) listingValues.push(chart_listing.values[listingIndex]);
            else if (i === 0) listingValues.push(0);
            else listingValues.push(listingValues[i - 1]);

            const volumeIndex = chart_volume.timestamps.findIndex((item) => item === timestamp);
            if (volumeIndex >= 0) volumeValues.push(chart_volume.values[volumeIndex]);
            else if (i === 0) volumeValues.push(0);
            else volumeValues.push(volumeValues[i - 1]);
        }

        return res.status(200).json({ success: true, data: {
                floorValues,
                listingValues,
                volumeValues,
                timestamps
        }});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthRecentTrades = async (req: Request, res: Response) => {
    try {
        const { contract } = req.params

        if (!contract) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                contract,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const activityCondition = {
            where: {
                created_at: {
                    [Op.gte]: moment().subtract(RECENT_TRADE_DAY, 'days').toDate()
                },
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                collectionId: collection.id,
                status: 1
            },
            raw: true
        }

        const activities = await ActivityService.findAll(activityCondition);

        return res.status(200).json({ success: true, data: {
            activities
        }});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthAttributes = async (req: Request, res: Response) => {
    try {
        const { contract } = req.params

        if (!contract) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                contract,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }
        
        let attributes: any[] = []
        if (collection.attributes) {
            attributes = collection.attributes;
        }
        else {
            const collectionInfo = await getCollectionInfo(contract);
            console.log('collectionInfo', collectionInfo.total, collectionInfo.page, collectionInfo.page_size);
    
            for (let i = 0; i < collectionInfo.result.length; i ++) {
                const metadata = JSON.parse(collectionInfo.result[i].metadata)
                for (let j = 0; j < metadata.attributes.length; j ++) {
                    const attribute = metadata.attributes[j];
                    const index = attributes.findIndex((item: any) => item.type === attribute.trait_type && item.value === attribute.value);
                    if (index >= 0) attributes[index].count += 1;
                    else attributes.push({
                        type: attribute.trait_type,
                        value: attribute.value,
                        count: 1
                    })
                }
            }
            attributes = attributes.map((item) => ({
                ...item,
                percent: item.count / collectionInfo.result.length * 100
            }))
            console.log('attributes', attributes);
            collection.attributes = attributes;
            await collection.save();
        }

        const nfts = await NftService.findAll({
            where: {
                collectionId: collection.id,
                status: 1
            }
        });

        attributes = attributes.map((item: any) => {
            const filteredNfts = nfts.filter((nft: any) => nft.attributes.find((attribute: any) => item.type === attribute.trait_type && item.value === attribute.value));
            let minPrice: any = null;
            if (filteredNfts.length > 0) {
                minPrice = filteredNfts[0].price;
                for (let i = 1 ; i < filteredNfts.length; i ++) {
                    if (filteredNfts[i].price < minPrice) minPrice = filteredNfts[i].price;
                }
            }

            return {
                ...item,
                minPrice
            }
        })
        return res.status(200).json({ success: true, data: {
            attributes
        }});
    }
    catch (err) {
        console.log(err);
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getEthTopHolders = async (req: Request, res: Response) => {
    try {
        const { contract } = req.params

        if (!contract) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                contract,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        let holders = await getHolders(contract);
        let holderCounts: any[] = [];

        for (let i = 0 ; i < holders.length; i ++) {
            const holder = holders[i];
            if (!holder) continue;
            let owner = holder.owner_of;
            if (owner === ETH.ERC721Contract || owner === ETH.ERC1155Contract) {
                const nft = await NftService.findOne({
                    where: {
                        collectionId: collection.id,
                        nftId: holder.token_id
                    }
                });

                if (!nft) continue;
                owner = nft.walletAddress;
            }
            
            const index = holderCounts.findIndex((item: any) => item.holder === owner);
            if (index >= 0) holderCounts[index].count += 1; 
            else holderCounts.push({
                holder: owner,
                count: 1
            })
        }
        console.log('holderCounts', holderCounts);
        holderCounts = holderCounts.sort((a: any, b: any) => b.count - a.count)
        .filter((_item: any, index: number) => index < TOP_COLLECTION_HOLDER_COUNT);
        const nftCondition = {
            where: {
                collectionId: collection.id,
                status: 1
            },
            attributes: [
                [Sequelize.fn('min', Sequelize.col('price')), 'minPrice']
            ],
            raw: true
        }
        const nftStatistic = await NftService.findAll(nftCondition);
        console.log('nftStatistic', nftStatistic)
        const floorPrice = nftStatistic[0]?.minPrice || 0;

        for (let i = 0; i < holderCounts.length; i ++) {
            const result = await NftService.findAll({
                where: {
                    walletAddress: holderCounts[i].holder,
                    collectionId: collection.id,
                    status: 1
                }
            })
            holderCounts[i] = {
                ...holderCounts[i],
                listedCount: result.length,
                percent: holderCounts[i].count / collection.totalSupply * 100,
                totalValue: floorPrice * holderCounts[i].count
            }
        }
        return res.status(200).json({ success: true, data: holderCounts});
    }
    catch (error) {
        console.log('error', error);
    }
}

export const getEthListDistribution =async (req: Request, res: Response) => {
    try {
        const { contract } = req.params

        if (!contract) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                contract,
                status: 1,
            }
        }

        const collection = await CollectionService.findOne(condition)
        if (!collection) {
            return res.status(400).json(BAD_REQUEST)
        }

        const nftCondition = {
            where: {
                collectionId: collection.id,
                status: 1
            },
            attributes: [
                [Sequelize.fn('min', Sequelize.col('price')), 'minPrice'],
                [Sequelize.fn('max', Sequelize.col('price')), 'maxPrice']
            ],
            raw: true
        }
        const nftStatistic = await NftService.findAll(nftCondition);
        const minPrice = nftStatistic[0]?.minPrice;
        const maxPrice = nftStatistic[0]?.maxPrice;
        const nfts = await NftService.findAll({
            where: {
                collectionId: collection.id,
                status: 1
            }
        });

        let distributions = [
            {
                startPercent: 0,
                startValue: 0,
                endPercent: 5,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 5,
                count: 0
            },
            {
                startPercent: 5,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 5,
                endPercent: 10,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 10,
                count: 0
            },
            {
                startPercent: 10,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 10,
                endPercent: 15,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 15,
                count: 0
            },
            {
                startPercent: 15,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 15,
                endPercent: 20,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 20,
                count: 0
            },
            {
                startPercent: 20,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 20,
                endPercent: 30,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 30,
                count: 0
            },
            {
                startPercent: 30,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 30,
                endPercent: 40,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 40,
                count: 0
            },
            {
                startPercent: 40,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 40,
                endPercent: 50,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 50,
                count: 0
            },
            {
                startPercent: 50,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 50,
                endPercent: 75,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 75,
                count: 0
            },
            {
                startPercent: 75,
                startValue: minPrice + (maxPrice - minPrice) / 100 * 75,
                endPercent: 100,
                endValue: minPrice + (maxPrice - minPrice) / 100 * 100,
                count: 0
            }
        ]

        for (let i = 0 ; i < nfts.length; i ++) {
            const nft = nfts[i];
            const index = distributions.findIndex(
                (item: any) => nft.price > item.startValue && nft.price <= item.endValue
            );
            if (index >= 0) distributions[index].count += 1;
        }

        return res.status(200).json({ success: true, data: distributions});
    }
    catch (error) {
        console.log('error', error);
        return res.status(500).json(BACKEND_ERROR);
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
                        name: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    },
                    {
                        symbol: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    }
                ]
            },
            order: [[params.column, params.direction]],
            limit: params.rowsPerPage,
            offset: (params.currentPage - 1) * params.rowsPerPage
        }
        const result = await CollectionService.findAndCountAll(condition)

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const addEvent = async (req: Request, res: Response) => {
    try {
        let { data } = req.body

        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }
        data = JSON.parse(data)
        if (req.files !== null) {
            const dir = `${__dirname}/../build`
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir)
            }
            if (!fs.existsSync(`${dir}/uploads`)) {
                fs.mkdirSync(`${dir}/uploads`)
            }

            const baseImage = req.files.baseImage as UploadedFile
            if (baseImage !== undefined) {
                const index = baseImage['name'].lastIndexOf('.')
                const format = baseImage['name'].substring(index, baseImage['name'].length)
                const name = new Date().getTime().toString() + format

                await baseImage.mv(`${dir}/uploads/${name}`)
                data['baseImage'] = '/uploads/' + name
            }
        }
        data['status'] = 0

        delete data.id

        let hashlist = []

        for (let i = 0; i < data['creators'].length; i++) {
            const temp = await getMintAddress(data['creators'][i])
            hashlist = [...hashlist, ...temp]
        }

        data['totalSupply'] = hashlist.length

        let attributes = []

        const collectibles = await solanaClient.getAllCollectiblesFromHashList(hashlist, [])

        collectibles.nfts.map((nft: any, index: any) => {
            if (nft.attributes !== undefined) {
                nft.attributes.map((attr: any, index: any) => {
                    const filterArr = attributes.filter((newAttr: any, index: any) => newAttr.trait_type === attr.trait_type)
                    if (filterArr.length > 0) {
                        const indexNum = attributes.indexOf(filterArr[0])
                        if (attributes[indexNum].value.indexOf(attr.value) === -1) {
                            attributes[indexNum] = {
                                ...attributes[indexNum],
                                value: [
                                    ...attributes[indexNum].value,
                                    attr.value
                                ]
                            }
                        }
                    } else {
                        attributes.push({
                            trait_type: attr.trait_type,
                            value: [
                                attr.value
                            ]
                        })
                    }
                })
            }
        })

        data['attributes'] = attributes

        const nftNameArray = collectibles.nfts[0].data.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        data['nftName'] = nftName

        const result = await CollectionService.create(data)

        await HashlistService.create({
            collectionId: result.id,
            nftName,
            hashlist
        })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateEvent = async (req: Request, res: Response) => {
    try {
        let { data } = req.body

        if (data === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        data = JSON.parse(data)

        if (req.files !== null) {
            const dir = `${__dirname}/../build`
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir)
            }
            if (!fs.existsSync(`${dir}/uploads`)) {
                fs.mkdirSync(`${dir}/uploads`)
            }

            const baseImage = req.files.baseImage as UploadedFile
            if (baseImage !== undefined) {
                const index = baseImage['name'].lastIndexOf('.')
                const format = baseImage['name'].substring(index, baseImage['name'].length)
                const name = new Date().getTime().toString() + format

                await baseImage.mv(`${dir}/uploads/${name}`)
                data['baseImage'] = '/uploads/' + name
            }
        }

        let hashlist = []

        for (let i = 0; i < data['creators'].length; i++) {
            const temp = await getMintAddress(data['creators'][i])
            hashlist = [...hashlist, ...temp]
        }

        data['totalSupply'] = hashlist.length

        const collectibles = await solanaClient.getAllCollectiblesFromHashList(hashlist, [])

        let attributes = []

        collectibles.nfts.map((nft: any, index: any) => {
            if (nft.attributes !== undefined) {
                nft.attributes.map((attr: any, index: any) => {
                    const filterArr = attributes.filter((newAttr: any, index: any) => newAttr.trait_type === attr.trait_type)
                    if (filterArr.length > 0) {
                        const indexNum = attributes.indexOf(filterArr[0])
                        if (attributes[indexNum].value.indexOf(attr.value) === -1) {
                            attributes[indexNum] = {
                                ...attributes[indexNum],
                                value: [
                                    ...attributes[indexNum].value,
                                    attr.value
                                ]
                            }
                        }
                    } else {
                        attributes.push({
                            trait_type: attr.trait_type,
                            value: [
                                attr.value
                            ]
                        })
                    }
                })
            }
        })

        data['attributes'] = attributes
        const nftNameArray = collectibles.nfts[0].data.name.split(" ")
        const nftName = nftNameArray.slice(0, nftNameArray.length - 1).join('_').toLowerCase()

        data['nftName'] = nftName

        await HashlistService.update({
            collectionId: data.id,
            nftName: nftName,
            hashlist: hashlist
        }, { where: { collectionId: data.id } })

        const result = await CollectionService.update(data, { where: { id: data.id } })

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

        const result = await CollectionService.destroy({ where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const approveEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        if (id === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await CollectionService.update({ status: 1 }, { where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const rejectEvent = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        if (id === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await CollectionService.update({ status: 2 }, { where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    // User Panel
    getPopularCollections,
    getAllCollections,
    getCollectionOneBySymbol,
    getCollectionBySymbol,
    getAnalytics,
    getMarketGraph,
    getRecentTrades,
    getAttributes,
    getTopHolders,
    getListDistribution,

    getEthCollectionByAddress,
    getCollectionOneByContract,
    getCollectionByContract,
    getEthMarketGraph,
    getEthRecentTrades,
    getEthAttributes,
    getEthTopHolders,
    getEthListDistribution,
    // Admin Panel
    getData,
    addEvent,
    updateEvent,
    deleteEvent,
    approveEvent,
    rejectEvent,
}