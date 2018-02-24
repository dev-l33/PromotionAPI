var Web3 = require('web3');

var managerContract = require('../token/contract');

exports.createICO = (req, res) => {
    if (!Web3.utils.isAddress(req.body.artist_address)) {
        return res.status(400).json({
            message: "invalid artist_address",
            code: 100
        });
    }

    if (!req.body.token_name) {
        return res.status(400).json({
            message: "invalid token_name",
            code: 100
        });
    }

    if (!req.body.token_symbol) {
        return res.status(400).json({
            message: "invalid token_symbol",
            code: 100
        });
    }

    try {
        managerContract.methods.createToken(
                req.body.artist_address,
                req.body.token_name,
                req.body.token_symbol)
            .send()
            .on('transactionHash', hash => {
                console.log('Transaction Hash: ', hash);
                res.json({
                    success: true,
                    status: 'pending',
                    tx_hash: hash,
                    artist_address: req.body.artist_address,
                    token_name: req.body.token_name,
                    token_symbol: req.body.token_symbol
                });
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log("confirmation: ", confirmationNumber, receipt);
            })
            .on('receipt', function (receipt) {
                console.log("receipt: ", receipt);
            })
            .on('error', function (error) {
                console.log("error: ", error);
            }); // If there's an out of gas error the second parameter is the receipt.

        managerContract.once('TokenIssue',
            function (error, event) {
                console.log(error);
                console.log(event);
                // res.json(event);
            }
        );

        // managerContract.events.TokenIssue({
        //     filter: { artist: req.body.artist_address },
        //     fromBlock: 0
        // }, function(error, event){ console.log(event); })
        // .on('data', function(event){
        //     console.log(event); // same results as the optional callback above
        // })
        // .on('changed', function(event){
        //     // remove event from local database
        // })
        // .on('error', console.error);

        console.log("Transaction was sent");
    } catch (ex) {
        console.log(ex);
        res.status(500).json({
            message: ex.message
        });
    }
}

exports.getContractByArtist = (req, res) => {
    if (!Web3.utils.isAddress(req.params.artist_address)) {
        return res.status(400).json({
            message: "invalid artist_address"
        });
    }
    try {
        Promise.all([
                managerContract.methods.getToken(req.params.artist_address).call(),
                managerContract.methods.getCrowdsale(req.params.artist_address).call()
            ])
            .then(([tokenAddress, crowdsaleAddress]) => {
                if (tokenAddress != '0x0000000000000000000000000000000000000000' &&
                    crowdsaleAddress != '0x0000000000000000000000000000000000000000' &&
                    Web3.utils.isAddress(tokenAddress) &&
                    Web3.utils.isAddress(crowdsaleAddress)) {
                    res.json({
                        success: true,
                        artist: req.params.artist_address,
                        token: tokenAddress,
                        crowdsale: crowdsaleAddress
                    });
                } else {
                    res.status(404).json({
                        message: `The artist ${req.params.artist_address} doesn't have token`,
                        artist: req.params.artist_address
                    });
                }
            })
            .catch(error => {
                res.status(500).json({
                    message: ex.error
                });
            });
    } catch (ex) {
        console.log(ex);
        res.status(500).json({
            message: ex.message
        });
    }
}