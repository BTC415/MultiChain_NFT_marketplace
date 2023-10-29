import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/user'

// User Panel
router.post('/create', ctrl.createUser);
router.post('/delete', ctrl.deleteUser);
router.get('/getUserIdByUsername', ctrl.getUserIdByUsername);
router.get('/getAllUsers', ctrl.getAllUsers);
export default router