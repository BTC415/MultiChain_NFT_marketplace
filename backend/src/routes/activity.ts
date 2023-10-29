import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/activity'

// User Panel
router.post('/wallet', ctrl.getMyActivities) // walletAddress
router.post('/nft', ctrl.getNftActivities) // mintAddress
router.post('/collection', ctrl.getCollectionActivities) // symbol

// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router