import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/message'

// User Panel
router.post('/create', ctrl.createMessage);
router.post('/delete', ctrl.deleteMessage)
router.get('/getMessagesByRoomID', ctrl.getMessagesByRoomID);
// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router