import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/room'

// User Panel
router.post('/createPtoPRoom', ctrl.createPtoPRoom);
router.post('/createGroupRoom', ctrl.createGroupRoom);
router.post('/updatePtoPRoom', ctrl.updatePtoPRoom);
router.post('/updateGroupRoom', ctrl.updateGroupRoom);

router.post('/delete', ctrl.deleteRoom);
router.get('/getRoomById',ctrl.getRoomById);
router.get('/getRoomByUser',ctrl.getRoomByUser);
router.get('/getAllRooms', ctrl.getAllRooms);

export default router