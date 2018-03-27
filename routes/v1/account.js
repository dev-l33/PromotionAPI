var express = require('express');
var router = express.Router();
var accountController = require('../../controllers/accountController');

router.get('/create', accountController.create);
router.post('/sendTransaction', accountController.sendTransaction);
router.get('/addToWhitelist/:address', accountController.addToWhitelist);

module.exports = router;