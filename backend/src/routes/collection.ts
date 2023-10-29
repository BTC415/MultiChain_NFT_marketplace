import { Router } from 'express'

const router = Router()

import ctrl from '../controllers/collection'

// User Panel
router.get('/popular', ctrl.getPopularCollections) // with isPopular = true
router.get('/', ctrl.getAllCollections) // with status = 1
router.get('/all', ctrl.getAllCollections) // with status = 1
router.get('/symbol/:symbol', ctrl.getCollectionOneBySymbol) // with status = 1, symbol
router.post('/symbol', ctrl.getCollectionBySymbol) // with status = 1, symbol
router.post('/analytics', ctrl.getAnalytics)
router.get('/symbol/:symbol/marketgraph', ctrl.getMarketGraph)
router.get('/symbol/:symbol/recent_trades', ctrl.getRecentTrades);
router.get('/symbol/:symbol/attributes', ctrl.getAttributes);
router.get('/symbol/:symbol/topholders', ctrl.getTopHolders);
router.get('/symbol/:symbol/list_distribution', ctrl.getListDistribution);
//eth
router.get('/:wallet', ctrl.getEthCollectionByAddress);
router.get('/eth/contract/:contract', ctrl.getCollectionOneByContract) 
router.post('/eth/contract', ctrl.getCollectionByContract) 
router.get('/eth/contract/:contract/marketgraph', ctrl.getEthMarketGraph)
router.get('/eth/contract/:contract/recent_trades', ctrl.getEthRecentTrades);
router.get('/eth/contract/:contract/attributes', ctrl.getEthAttributes);
router.get('/eth/contract/:contract/topholders', ctrl.getEthTopHolders);
router.get('/eth/contract/:contract/list_distribution', ctrl.getEthListDistribution);

// Admin Panel
router.post('/', ctrl.getData)
router.post('/add-event', ctrl.addEvent)
router.post('/update-event', ctrl.updateEvent)
router.post('/delete-event', ctrl.deleteEvent)
router.post('/approve-event', ctrl.approveEvent)
router.post('/reject-event', ctrl.rejectEvent)

export default router