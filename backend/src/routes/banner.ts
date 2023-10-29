import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/banner'

// User Panel
router.get('/', ctrl.getBanners) // with status = 1

// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router