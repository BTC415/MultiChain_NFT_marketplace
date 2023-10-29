import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/nft'

// User Panel
router.post('/wallet', ctrl.getNftByWalletAddress) // walletAddress
router.get('/wallet/:walletAddress/:status', ctrl.getNftByWalletAddress) // walletAddress
router.get('/item/:mintAddress', ctrl.getNftByMintAddress) // mintAddress
router.get('/item/:mintAddress/salegraph', ctrl.getNftSaleGraph)
router.post('/more', ctrl.getMoreNFTsBySymbol) // with status = 1, symbol

router.post('/buy', ctrl.buyNft)
router.post('/list', ctrl.listNft)
router.post('/unlist', ctrl.unlistNft)
router.post('/update', ctrl.updateNft)

router.post('/buyTx', ctrl.buyNftTransaction)
router.post('/listTx', ctrl.listNftTransaction)
router.post('/unlistTx', ctrl.unlistNftTransaction)
router.post('/updateListTx', ctrl.updateNftTransaction)

// ethereum
router.get('/:wallet', ctrl.getEthNftsByAddress);
router.get('/eth/:contract/:id', ctrl.getEthNft);
router.get('/eth/:contract/:id/salegraph', ctrl.getEthNftSaleGraph)
router.post('/eth/list', ctrl.listEthNft);
router.post('/eth/unlist', ctrl.unlistEthNft);
router.post('/eth/buy', ctrl.buyEthNft);
router.post('/eth/update', ctrl.updateEthNft);

// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)

export default router