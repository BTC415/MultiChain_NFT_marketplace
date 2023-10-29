import { Router, Request, Response } from 'express'
// import { authenticate, authError } from '../../middlewares/auth'
import ctrl from '../controllers/jwt'

const router = Router()

router.post('/login', ctrl.login)

router.post('/changeAccount', ctrl.changeAccount)

// router.post('/register', ctrl.register)

// router.post('/refresh-token', ctrl.refreshToken)


export default router
