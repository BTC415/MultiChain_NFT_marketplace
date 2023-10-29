import { Router, Request, Response } from 'express';

const router = Router()

import jwtRoutes from './jwt'

import activityRoutes from './activity'
import bannerRoutes from './banner'
import bidRoutes from './bid'
import roomRoutes from './room'
import userRoutes from './user'
import messageRoutes from './message'
import collectionRoutes from './collection'
import hashlistRoutes from './hashlist'
import nftRoutes from './nft'
import settingRoutes from './setting'
import walletRoutes from './wallet'
import globalRoutes from './global'

// Backend Test
router.get('/test', (req: Request, res: Response) =>
  res.send('OK')
)

router.use('/jwt', jwtRoutes);
router.use('/activity', activityRoutes);
router.use('/banner', bannerRoutes);
router.use('/bid', bidRoutes);
router.use('/room', roomRoutes);
router.use('/user', userRoutes);
router.use('/message', messageRoutes);
router.use('/collection', collectionRoutes);
router.use('/hashlist', hashlistRoutes);
router.use('/nft', nftRoutes);
router.use('/setting', settingRoutes);
router.use('/wallet', walletRoutes);
router.use('/global', globalRoutes);

export default router;