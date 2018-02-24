var express = require('express');
var router = express.Router();
var promoController = require('../../controllers/promoController');
var tokenController = require('../../controllers/tokenController');

router.use('/', promoController.checkAuth);

router.post('/create', tokenController.createICO);
router.get('/contract/:artist_address', tokenController.getContractByArtist);

module.exports = router;
