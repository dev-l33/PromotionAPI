var express = require('express');
var router = express.Router();
var promoController = require('../../controllers/promoController');
var tokenController = require('../../controllers/tokenController');

router.use('/', promoController.checkAuth);

router.post('/create', tokenController.createICO);
router.get('/token/:artist_address', tokenController.getTokenByArtist);
router.get('/crowdsale/:artist_address', tokenController.getCrowdsaleByArtist);

module.exports = router;
