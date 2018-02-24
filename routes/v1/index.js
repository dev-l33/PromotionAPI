var express = require('express');
var router = express.Router();
var promo = require('./promo');
var token = require('./token');

router.use('/promotion', promo);
router.use('/ico', token);

module.exports = router;