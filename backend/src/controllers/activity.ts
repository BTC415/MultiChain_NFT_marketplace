import { Request, Response } from 'express'
import ActivityService from '../services/activity'
import CollectionService from '../services/collection'

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import Sequelize from "sequelize"
const Op = Sequelize.Op

// User Panel
const getMyActivities = async (req: Request, res: Response) => {
    try {
        const { walletAddress, limit, currentPage } = req.body
        if (walletAddress === undefined || limit === undefined || currentPage === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                [Op.or]: [
                    { from: walletAddress },
                    { to: walletAddress }
                ]
            },
            order: [['created_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }
        const result = await ActivityService.findAndCountAll(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getNftActivities = async (req: Request, res: Response) => {
    try {
        const { mintAddress, contract, id, limit, currentPage } = req.body
        console.log('contract', contract, 'id', id);
        if (limit === undefined || currentPage === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }
        let where = {}
        if (mintAddress) {
            where = {
                mintAddress
            }
        }
        else if (contract && id) {
            const collection = await CollectionService.findOne({
                where: {
                    contract
                }
            })
            if (!collection) return res.status(400).json(BAD_REQUEST)
            where = {
                collectionId: collection.id,
                nftId: id
            }
        }
        else {
            return res.status(400).json(BAD_REQUEST)
        }
        const condition = {
            where,
            order: [['created_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }
        const result = await ActivityService.findAndCountAll(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getCollectionActivities = async (req: Request, res: Response) => {
    try {
        const { symbol, contract, limit, currentPage } = req.body
        if (limit === undefined || currentPage === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        let collection = null;
        if (symbol) 
            collection = await CollectionService.findOne({ where: { symbol } })
        else if (contract) 
            collection = await CollectionService.findOne({ where: { contract } })
        else 
            return res.status(400).json(BAD_REQUEST)
        const condition = {
            where: {
                collectionId: collection.id
            },
            order: [['created_at', 'DESC']],
            limit,
            offset: (currentPage - 1) * limit
        }
        const result = await ActivityService.findAndCountAll(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        console.log('err', err);
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
                        mintAddress: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    },
                    {
                        name: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    }
                ]
            },
            order: [[params.column, params.direction]],
            limit: params.rowsPerPage,
            offset: (params.currentPage - 1) * params.rowsPerPage
        }
        const result = await ActivityService.findAndCountAll(condition)

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

        const result = await ActivityService.create(data)

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

        const result = await ActivityService.update(data, { where: { id: data.id } })

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

        const result = await ActivityService.destroy({ where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    // User Panel
    getMyActivities,
    getNftActivities,
    getCollectionActivities,
    // Admin Panel
    getData,
    addEvent,
    updateEvent,
    deleteEvent,
}