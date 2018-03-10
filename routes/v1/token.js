var express = require('express');
var router = express.Router();
var tokenController = require('../../controllers/tokenController');

router.post('/create', tokenController.createICO);
router.post('/stage/create', tokenController.createStage);
router.post('/allocate', tokenController.allocateTokens);
router.get('/contract/:artist_address', tokenController.getContractByArtist);
router.get('/balance/:contract/:account', tokenController.tokenBalance);
router.get('/ethusd', tokenController.getEthUsdPrice);

module.exports = router;
