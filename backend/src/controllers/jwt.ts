import { Request, Response } from 'express'
import AdminService from '../services/admin'

import { BAD_REQUEST, BACKEND_ERROR } from '../config'

import jwt from 'jsonwebtoken'
import { jwtConfig } from "../config"

const data = {
  users: [
    {
      id: 1,
      fullName: 'Sales Bot',
      username: 'salesbot',
      password: 'admin',
      avatar: '',
      email: 'admin@demo.com',
      role: 'admin',
      ability: [
        {
          action: 'manage',
          subject: 'all'
        }
      ],
      extras: {
        eCommerceCartItemsCount: 5
      }
    },
    {
      id: 2,
      fullName: 'Discord Bot',
      username: 'discordbot',
      password: 'client',
      avatar: '',
      email: 'client@demo.com',
      role: 'client',
      ability: [
        {
          action: 'read',
          subject: 'ACL'
        },
        {
          action: 'read',
          subject: 'Auth'
        }
      ],
      extras: {
        eCommerceCartItemsCount: 5
      }
    }
  ]
}

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body

    if (email === undefined || password === undefined) {
      return res.status(400).json(BAD_REQUEST)
    }

    let error = {
      email: ['Something went wrong']
    }

    const defaultAdmin = await AdminService.findOne({ where: { email: 'admin@submarine.com' } })
    if (defaultAdmin === null) {
      await AdminService.create({
        "fullName": "Submarine Admin",
        "username": "Submarine",
        "password": "admin",
        "avatar": "",
        "email": "admin@submarine.com",
        "role": "admin",
        "ability": [
          {
            "action": "manage",
            "subject": "all"
          }
        ]
      })
    }

    const user = await AdminService.findOne({ where: { email, password } })

    if (user !== null) {
      const admin = user.toJSON()
      try {
        const accessToken = jwt.sign({ id: admin.id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime })
        const refreshToken = jwt.sign({ id: admin.id }, jwtConfig.refreshTokenSecret, {
          expiresIn: jwtConfig.refreshTokenExpireTime
        })

        const userData = { ...admin }

        delete userData.password

        const response = {
          userData,
          accessToken,
          refreshToken
        }

        return res.json(response)
      } catch (e) {
        error = e
      }
    } else {
      error = {
        email: ['Email or Password is Invalid']
      }
    }

    return res.status(400).json({ success: false, message: error, data: null })
  } catch (e) {

  }
}

const changeAccount = async (req: Request, res: Response) => {
  try {
    const { userData } = req.body

    if (userData === undefined) {
      return res.json({ success: false, data: null, message: 'Paramater is required!' })
    }

    const user = await AdminService.findOne({
      where: {
        email: userData.email
      }
    })

    if (user === null) {
      return res.json(user)
    }

    if (userData.cPassword !== '') {
      if (userData.nPassword !== userData.mPassword) {
        return res.json({ success: false, data: null, message: 'New passwords do not match!' })
      }

      if (userData.cPassword !== user.password) {
        return res.json({ success: false, data: null, message: 'Current Password is not correct!' })
      }
      user.password = userData.nPassword
    }

    user.fullName = userData.fullName
    user.username = userData.username
    user.email = userData.email
    user.save()

    return res.json({ success: true, data: null, message: 'Account successfully changed.' })
  } catch (e) {
    console.log(e)
    return res.status(500).json({ success: false, data: null, message: 'Backend Server Failed!' })
  }
}

// const register = async (req: Request, res: Response) => {
//   if (!!req.body.email) {
//     const { email, password, username } = req.body
//     const isEmailAlreadyInUse = data.users.find(user => user.email === email)
//     const isUsernameAlreadyInUse = data.users.find(user => user.username === username)
//     const error = {
//       email: isEmailAlreadyInUse ? 'This email is already in use.' : null,
//       username: isUsernameAlreadyInUse ? 'This username is already in use.' : null
//     }

//     if (!error.username && !error.email) {
//       const userData = {
//         email,
//         password,
//         username,
//         fullName: '',
//         avatar: null,
//         role: 'admin',
//         ability: [
//           {
//             action: 'manage',
//             subject: 'all'
//           }
//         ]
//       }

//       // Add user id
//       const length = data.users.length
//       let lastIndex = 0
//       if (length) {
//         lastIndex = data.users[length - 1].id
//       }
//       userData.id = lastIndex + 1

//       data.users.push(userData)

//       const accessToken = jwt.sign({ id: userData.id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime })

//       const user = Object.assign({}, userData)
//       delete user['password']
//       const response = { user, accessToken }

//       return res.json(response)
//     } else {
//       return res.json(error)
//     }
//   }
// }

// const refreshToken = async (req: Request, res: Response) => {
//   const { refreshToken } = req.body

//   try {
//     const { id } = jwt.verify(refreshToken, jwtConfig.refreshTokenSecret)

//     const userData = { ...data.users.find(user => user.id === id) }

//     const newAccessToken = jwt.sign({ id: userData.id }, jwtConfig.secret, { expiresIn: jwtConfig.expireTime })
//     const newRefreshToken = jwt.sign({ id: userData.id }, jwtConfig.refreshTokenSecret, {
//       expiresIn: jwtConfig.refreshTokenExpireTime
//     })

//     delete userData.password
//     const response = {
//       userData,
//       accessToken: newAccessToken,
//       refreshToken: newRefreshToken
//     }

//     return res.json(response)
//   } catch (e) {
//     const error = 'Invalid refresh token'
//     return res.status(401).json(error)
//   }
// }


export default {
  login,
  // register,
  // refreshToken,
  changeAccount
}