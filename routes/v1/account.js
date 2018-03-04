var express = require('express');
var router = express.Router();
var accountController = require('../../controllers/accountController');

router.get('/create', accountController.create);
router.post('/sendTransaction', accountController.sendTransaction);

module.exports = router;