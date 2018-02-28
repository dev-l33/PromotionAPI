var express = require('express');
var router = express.Router();
var accountController = require('../../controllers/accountController');

router.get('/create', accountController.create);

module.exports = router;