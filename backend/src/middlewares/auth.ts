import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()

const authenticate = (req: Request, res: Response) => {
  const token = req.headers.authorization || ''
  jwt.verify(token, process.env.JWT_SECRET, (error, decoded) => {
    if (error) {
      res.status(401).json({ error: "Your authentication invalid." })
    } else {
      // const { expiredAt, email } = decoded
      // if (expiredAt > new Date().getTime()) {
      //   req.email = email
      //   req.token = token
      //   next();
      // } else {
      //   res.status(401).json({ error: "Login Expired!. Please log back into the platform." })
      // }
    }
  })
}

const authError = (err, req, res, next) => {
  res.json(err)
}

export default {
  authenticate,
  authError
}
