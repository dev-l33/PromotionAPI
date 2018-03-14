var express = require('express');
var router = express.Router();
var ethController = require('../../controllers/ethController');

router.get('/tx/receipt/:tx_hash', ethController.transactionReceipt);

module.exports = router;