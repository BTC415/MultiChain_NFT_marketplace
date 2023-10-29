import { Request, Response } from 'express'
import Sequelize from "sequelize"
import moment from 'moment'
import { BACKEND_ERROR } from '../config'
import ActivityService from '../services/activity'
import { getCoinPrice, getSOLTps } from '../helpers'
import CollectionService from '../services/collection'

const Op = Sequelize.Op

const getStatus = async (req: Request, res: Response) => {
    try {
        const solCollections = await CollectionService.findAll({
            where: {
                chain: 0
            }
        });
        const ethCollections = await CollectionService.findAll({
            where: {
                chain: 1
            }
        });

        const solIds = solCollections.map((item) => item.id);
        const ethIds = ethCollections.map((item) => item.id);
        const solActivityCondition1 = {
            where: {
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                collectionId: { [Op.in]: solIds },
                status: 1
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const solActivityCondition2 = {
            where: {
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days').toDate()
                },
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                collectionId: { [Op.in]: solIds },
                status: 1
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const solActivityStatistic1 = await ActivityService.findAll(solActivityCondition1)
        const solActivityStatistic2 = await ActivityService.findAll(solActivityCondition2)

        const ethActivityCondition1 = {
            where: {
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                collectionId: { [Op.in]: ethIds },
                status: 1
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const ethActivityCondition2 = {
            where: {
                created_at: {
                    [Op.gte]: moment().subtract(1, 'days').toDate()
                },
                type: {
                    [Op.or]: [4, 8] // Buy, Accept
                },
                collectionId: { [Op.in]: ethIds },
                status: 1
            },
            attributes: [
                [Sequelize.fn('sum', Sequelize.col('price')), 'totalVolume'],
            ],
            raw: true
        }

        const ethActivityStatistic1 = await ActivityService.findAll(ethActivityCondition1)
        const ethActivityStatistic2 = await ActivityService.findAll(ethActivityCondition2)

        const solPrice = await getCoinPrice('SOL');
        const ethPrice = await getCoinPrice('ETH');
        const solTps = await getSOLTps();
        const result = {
            totalVolume: Number(solActivityStatistic1[0].totalVolume) * solPrice + Number(ethActivityStatistic1[0].totalVolume) * ethPrice,
            volume24h: Number(solActivityStatistic2[0].totalVolume) * solPrice + Number(ethActivityStatistic2[0].totalVolume) * ethPrice,
            solPrice,
            ethPrice,
            solTps
        }
        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}


export default {
    getStatus
}