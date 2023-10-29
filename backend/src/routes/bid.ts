import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/bid'

// User Panel
router.post('/nft-wallet', ctrl.getBidByNftAndWallet) // mintAddress
router.post('/wallet', ctrl.getBidsByWallet) // walletAddress
router.post('/receive', ctrl.getReceivedBids) // walletAddress
router.post('/nft', ctrl.getBidsByNFT) // mintAddress
router.post('/top', ctrl.getTopBidByNFT) // mintAddress

router.post('/make', ctrl.makeBid)
router.post('/update', ctrl.updateBid)
router.post('/cancel', ctrl.cancelBid)
router.post('/accept', ctrl.acceptBid)


// eth

router.post('/eth/nft-wallet', ctrl.getEthBidByNftAndWallet) // mintAddress
router.post('/eth/nft', ctrl.getEthBidsByNFT) // mintAddress
router.post('/eth/top', ctrl.getEthTopBidByNFT) // mintAddress

router.post('/eth/make', ctrl.makeEthBid)
router.post('/eth/update', ctrl.updateEthBid)
router.post('/eth/cancel', ctrl.cancelEthBid)
router.post('/eth/accept', ctrl.acceptEthBid)

router.post('/makeTx', ctrl.makeBidTransaction)
router.post('/updateTx', ctrl.updateBidTransaction)
router.post('/cancelTx', ctrl.cancelBidTransaction)
router.post('/acceptTx', ctrl.acceptBidTransaction)

// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router