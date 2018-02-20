var express = require('express');
var router = express.Router();
var promoController = require('../../controllers/promoController');
var tokenController = require('../../controllers/tokenController');

router.use('/', promoController.checkAuth);

router.post('/createToken', tokenController.createToken);
router.get('/get/:artist_address', tokenController.getTokenByArtist);

module.exports = router;
