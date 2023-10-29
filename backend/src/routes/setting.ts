import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/setting'

// User Panel
router.get('/key/:key', ctrl.getSetting) // key

// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router