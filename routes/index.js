var express = require('express');
var router = express.Router();
const jwt = require('jsonwebtoken');

const versions = {
    'v1': require('./v1')
};

const {
    JWT_PASSPHRASE: jwtPassphrase
} = process.env;

/* GET home page. */
router.get('/', (req, res) => res.send("Hunter Microservice REST API is working"));

/* check authorization */
router.use('/api', (req, res, next) => {
    req.user = undefined;
    if (req.headers && req.headers.authorization) {
        let auth = req.headers.authorization.split(' ');
        console.log(auth);
        if(auth[0] == 'API-KEY') {
            if (auth[1] == 'TESTKEY') {
                req.authorized = true;
            }
        }
    }
    next();
});

router.use('/api/1', versions['v1']);

module.exports = router;
