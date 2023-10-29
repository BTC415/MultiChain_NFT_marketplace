import { Request, Response } from 'express'
import BannerService from '../services/banner'

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import fs from 'fs'
import { UploadedFile } from 'express-fileupload'

import Sequelize from "sequelize"
const Op = Sequelize.Op

// User Panel
const getBanners = async (req: Request, res: Response) => {
    try {
        const condition = {
            where: { status: 1 },
            raw: true
        }
        const result = await BannerService.findAll(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
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
                        title: {
                            [Op.like]: `%${params.searchValue}%`
                        }
                    }
                ]
            },
            order: [[params.column, params.direction]],
            limit: params.rowsPerPage,
            offset: (params.currentPage - 1) * params.rowsPerPage
        }
        const result = await BannerService.findAndCountAll(condition)

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

            const bannerImage = req.files.bannerImage as UploadedFile
            if (bannerImage !== undefined) {
                const index = bannerImage['name'].lastIndexOf('.')
                const format = bannerImage['name'].substring(index, bannerImage['name'].length)
                const name = new Date().getTime().toString() + format

                await bannerImage.mv(`${dir}/uploads/${name}`)
                data['bannerImage'] = '/uploads/' + name
            }
        }

        delete data.id

        const result = await BannerService.create(data)

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

            const bannerImage = req.files.bannerImage as UploadedFile
            if (bannerImage !== undefined) {
                const index = bannerImage['name'].lastIndexOf('.')
                const format = bannerImage['name'].substring(index, bannerImage['name'].length)
                const name = new Date().getTime().toString() + format

                await bannerImage.mv(`${dir}/uploads/${name}`)
                data['bannerImage'] = '/uploads/' + name
            }
        }

        const result = await BannerService.update(data, { where: { id: data.id } })

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

        const result = await BannerService.destroy({ where: { id } })

        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    getBanners,
    // Admin Panel
    getData,
    addEvent,
    updateEvent,
    deleteEvent,
}