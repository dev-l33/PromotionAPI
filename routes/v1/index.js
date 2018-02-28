var express = require('express');
var router = express.Router();
var promo = require('./promo');
var token = require('./token');
var account = require('./account');

var promoController = require('../../controllers/promoController');

router.use('/', promoController.checkAuth);

router.use('/promotion', promo);
router.use('/ico', token);
router.use('/account', account);

module.exports = router;