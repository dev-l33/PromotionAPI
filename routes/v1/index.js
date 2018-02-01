var express = require('express');
var router = express.Router();
var promo = require('./promo');

router.use('/promotion', promo);

module.exports = router;