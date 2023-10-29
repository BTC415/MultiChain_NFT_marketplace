import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/global'

router.get('/status', ctrl.getStatus)

export default router