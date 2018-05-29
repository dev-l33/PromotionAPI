var express = require('express');
var router = express.Router();
var tokenController = require('../../controllers/tokenController');

router.post('/create', tokenController.createICO);
router.get('/create/status/:tx_hash', tokenController.getICOCreationStatus);
router.post('/stage/create', tokenController.createStage);
router.post('/stage/update', tokenController.updateStage);
router.post('/allocate', tokenController.allocateTokens);
router.post('/contract', tokenController.getContractInfo);
router.get('/balance/:contract/:account', tokenController.tokenBalance);
router.get('/ethusd', tokenController.getEthUsdPrice);

module.exports = router;
