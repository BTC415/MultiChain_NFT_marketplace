import { Request, Response } from 'express'
import RoomService from '../services/room'
import UserService from '../services/user'
import { BAD_REQUEST, BACKEND_ERROR } from '../config'
import Sequelize from "sequelize"
import room from '../services/room'
const Op = Sequelize.Op

// User Panel
const createPtoPRoom = async (req: Request, res: Response) => {
    try {
        const {name, users, lastMsg} = req.body
        if (!req.body) {
            return res.status(400).json(BAD_REQUEST)
        }
        let roomsList = await RoomService.findAll();
        let flag = true;
        for(let i = 0; i < roomsList.length; i ++) {
            if (roomsList[i].name === name) 
                flag = false;
        }
        let result;
        if (flag) {
            let usersList = users.split(",");
            let user1 = await UserService.findOne({ where: { name: usersList[0] } })
            let user2 = await UserService.findOne({ where: { name: usersList[1] } })
            let userId = user1.id + "," + user2.id
            let roomInfo = {
                name: name,
                users: userId,
                lastMsg: lastMsg
            }
            result = await RoomService.create(roomInfo)
            
        }
        else {
            result = "Room already exists";
        }
        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const createGroupRoom = async (req: Request, res: Response) => {
    try {
        const {name, users, lastMsg} = req.body
        if (!req.body) {
            return res.status(400).json(BAD_REQUEST)
        }
        let roomsList = await RoomService.findAll();
        let flag = true;
        for(let i = 0; i < roomsList.length; i ++) {
            if (roomsList[i].name === name) 
                flag = false;
        }
        let result;
        if (flag) {
            let user2 = await UserService.findOne({ where: { name: users } })
            let userId = user2.id
            let roomInfo = {
                name: name,
                users: userId,
                lastMsg: lastMsg
            }
            result = await RoomService.create(roomInfo)
        } else {
            result = "Room already exists";
        }
        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log('error: ', e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).json(BAD_REQUEST)
        }
        const result = await RoomService.deleteOne({ where: { id } })
        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        console.log(e)
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updatePtoPRoom = async (req: Request, res: Response) => {
    try {
        const {roomname, lastMessage} = req.body;
        if (!req.body) {
            return res.status(400).json(BAD_REQUEST)
        }
        const selectedRoom = await RoomService.findOne({where: { name: roomname }})
        let newRoom = {
            name: selectedRoom.name,
            users: selectedRoom.users,
            lastMsg: lastMessage
        }
        const result = await RoomService.update(newRoom, { where: { name: roomname } }) 
        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const updateGroupRoom = async (req: Request, res: Response) => {
    try {
        const {name, users, lastMsg} = req.body;
        if (!req.body) {
            return res.status(400).json(BAD_REQUEST)
        }
        const selectedRoom = await RoomService.findOne({where: { name: name }})
        let usersList = selectedRoom.users.split(",")
        const addedUser = await UserService.findOne({where: {name : users}})
        let flag = true;
        for (let i = 0; i < usersList.length; i ++) {
            if (usersList[i] == addedUser.id) flag = false;
        }
        console.log(addedUser);
        let result;
        if (flag) {
            let newRoom = {
                name: selectedRoom.name,
                users: selectedRoom.users + "," + addedUser.id,
                lastMsg: lastMsg
            }
            result = await RoomService.update(newRoom, { where: { name: name } }) 
        } else {
            result = "User already exists";
        }
        return res.json({ success: true, message: 'Success', data: result })
    } catch (e) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getRoomById = async (req: Request, res: Response) => {
    try {
        console.log("req.params", req.query)
        if (!req.query) {
            return res.status(400).json(BAD_REQUEST)
        }
        const condition = {
            where: {
                name: req.query.roomname,
            },
        }
        const result = await RoomService.findOne(condition)
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getRoomByUser = async (req: Request, res: Response) => {
    try {
        const { username } = req.query
        if ( !username ) {
            return res.status(400).json(BAD_REQUEST)
        }
        let userInfo = await UserService.findOne({ where: { name: username }})
        let userId = userInfo.id
        
        const roomsList = await RoomService.findAll()
        let roomUsersList = [];
        roomsList.map((val, i) => {
            roomUsersList.push(val.users)
        })
        let oneRoomUsersList = [];
        roomUsersList.map((val, i) => {
            let oneRoomUsers = val.split(",")
            oneRoomUsersList.push(oneRoomUsers)
        })
        let RoomList = []
        for (let i = 0; i < oneRoomUsersList.length; i ++){
            let userNameList = "";
            const val = oneRoomUsersList[i];
            if(val.includes(userId.toString())) {
                for (let j = 0; j < val.length; j ++) {
                    const uId = val[j];
                    let userName = await UserService.findOne({ where: { id: uId } })
                    userNameList = userNameList + "," + userName.name
                }
                roomsList[i].users = userNameList
                RoomList.push(roomsList[i])
            }
        }
        return res.status(200).json({ success: true, data: RoomList, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

const getAllRooms = async (req: Request, res: Response) => {
    try {
        const result = await RoomService.findAll()
        return res.status(200).json({ success: true, data: result, message: 'Success' })
    } catch (err) {
        return res.status(500).json(BACKEND_ERROR)
    }
}

export default {
    // User Panel
    createPtoPRoom,
    createGroupRoom,
    updatePtoPRoom,
    updateGroupRoom,
    deleteRoom,
    getRoomById,
    getAllRooms,
    getRoomByUser,
}