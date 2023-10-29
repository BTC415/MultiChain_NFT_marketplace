import Schema from '../models/user'

const findAll = async (): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.findAll()
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })

const findAndCountAll = async (condition: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.findAndCountAll(condition)
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })

const findOne = async (condition: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.findOne(condition)
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })

const findOrCreate = async (condition: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.findOrCreate(condition)
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })

const findByPk = async (primaryKey: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.findByPk(primaryKey)
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })


const create = async (data: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.create(data)
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })

const update = async (data: any, condition: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.update(
                data,
                condition
            )
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })


const deleteOne = async (condition: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const data = await Schema.findOne(condition)
            if (!!data) {
                const result = await Schema.update(
                    { status: 2 },
                    condition
                )
                resolve(result)
            }
        } catch (err) {
            reject(err)
        }
    })

const destroy = async (condition: any): Promise<any> =>
    new Promise(async (resolve, reject) => {
        try {
            const result = await Schema.destroy(condition)
            resolve(result)
        } catch (err) {
            reject(err)
            console.log(err)
        }
    })


export default {
    findAll,
    findAndCountAll,
    findOne,
    findOrCreate,
    findByPk,
    create,
    update,
    deleteOne,
    destroy
}