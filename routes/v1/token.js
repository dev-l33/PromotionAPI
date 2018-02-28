var express = require('express');
var router = express.Router();
var tokenController = require('../../controllers/tokenController');

router.post('/create', tokenController.createICO);
router.post('/stage/create', tokenController.createStage);
router.get('/contract/:artist_address', tokenController.getContractByArtist);

module.exports = router;
