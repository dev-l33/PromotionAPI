var express = require('express');
var router = express.Router();
var promoController = require('../../controllers/promoController');

router.get('/:code', promoController.getInfo);
router.post('/', promoController.create);
router.get('/activate/:code', promoController.activate);

module.exports = router;