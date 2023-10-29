import { Request, Response } from 'express'
import UserService from '../services/user'

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import Sequelize from "sequelize"
const Op = Sequelize.Op

// User Panel
const createUser = async (req: Request, res: Response) => {
    try {
        if (req.body === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }
        const usersList = await UserService.findAll();
        let nameArray = [];
        usersList.map((val, i) => {
            nameArray.push(val.name);
        });
        let flag = nameArray.includes(req.body.name);
        if(flag)
        {
            return res.json({ success: true, message: 'Success', data: 'Already exists' });
        } else {
            const result = await UserService.create(req.body);
            return res.json({ success: true, message: 'Success', data: result });
        }
        
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.body

        if (id === undefined) {
            return res.status(400).json(BAD_REQUEST)
        }

        const result = await UserService.deleteOne({ where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getUserById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        if (!id) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                id: id,
            },
        }
        const result = await UserService.findOne(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getUserIdByUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.query
        if (username) {
            return res.status(400).json(BAD_REQUEST)
        }

        const condition = {
            where: {
                name: username,
            },
        }
        const result = await UserService.findOne(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAllUsers = async (req: Request, res: Response) => {
    try {
        const result = await UserService.findAll()
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    // User Panel
    createUser,
    deleteUser,
    getAllUsers,
    getUserById,
    getUserIdByUsername,
}