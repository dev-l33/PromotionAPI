var web3 = require('../ethereum');
var Contracts = require('../token/contract');

var managerContract = Contracts.managerContract;

exports.create = (req, res) => {
    try {
        let account = web3.eth.accounts.create();
        console.log(`Account was created addr: ${account.address}`);
        res.json({
            success: true,
            address: account.address,
            privateKey: account.privateKey
        });
    } catch (ex) {
        console.log(ex);
        res.status(400).json({
            message: ex.message
        });
    }
}

exports.sendTransaction = (req, res) => {
    let replied = false;
    if (!web3.utils.isAddress(req.body.address)) {
        return res.status(422).json({
            message: "invalid address"
        });
    }

    if (!req.body.private_key) {
        return res.status(422).json({
            message: "invalid private key"
        });
    }

    if (!req.body.value) {
        return res.status(422).json({
            message: "invalid value"
        });
    }

    const {
        GAS_LOW,
        GAS_PRICE
    } = process.env;

    try {
        let value = parseFloat(req.body.value).toFixed(18);
        let account = web3.eth.accounts.wallet.add(req.body.private_key);
        // using the event emitter
        web3.eth.sendTransaction({
                from: account.address,
                to: req.body.address,
                value: web3.utils.toWei(value, "ether"),
                gas: GAS_LOW,
                gasPrice: GAS_PRICE
            })
            .on('transactionHash', function (hash) {
                console.log("transaction hash: ", hash);
                web3.eth.accounts.wallet.remove(account.index);
                res.json({
                    success: true,
                    status: 'pending',
                    tx_hash: hash,
                    from: account.address,
                    to: req.body.address,
                    value: value
                });
                replied = true;
            })
            .on('receipt', function (receipt) {
                // console.log("receipt: ", receipt);
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                // console.log("confirmation", receipt);
            })
            .on('error', error => {
                console.log(error);
                if (!replied) {
                    res.status(400).json({
                        message: String(error)
                    });
                }
            }); // If a out of gas error, the second parameter is the receipt.
    } catch (ex) {
        console.log(ex);
        if (!replied) {
            res.status(500).json({
                message: ex.message
            });
        }
    }
}

exports.addToWhitelist = (req, res) => {
    if (!web3.utils.isAddress(req.params.address)) {
        return res.status(422).json({
            message: "invalid address"
        });
    }

    let replied = false;
    managerContract.methods.addToWhitelist(req.params.address)
        .send()
        .on('transactionHash', hash => {
            console.log('Transaction Hash: ', hash);
            res.json({
                success: true,
                status: 'pending',
                tx_hash: hash,
                address: req.params.address
            });
            replied = true;
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            // console.log("confirmation: ", confirmationNumber, receipt);
        })
        .on('receipt', function (receipt) {
            // console.log("receipt: ", receipt);
        })
        .on('error', function (error) {
            console.log("error: ", error);
            if (!replied) {
                res.status(500).json({
                    message: String(error)
                });
            }
        }); // If there's an out of gas error the second parameter is the receipt.

    console.log("Transaction was sent");

}

exports.transferToken = (req, res) => {
    if (!web3.utils.isAddress(req.body.token)) {
        return res.status(422).json({
            message: "invalid token contract address"
        });
    }

    if (!req.body.private_key) {
        return res.status(422).json({
            message: "invalid private key of from address"
        });
    }

    if (!web3.utils.isAddress(req.body.to)) {
        return res.status(422).json({
            message: "invalid to address"
        });
    }

    if (!req.body.value) {
        return res.status(422).json({
            message: "invalid value"
        });
    }

    const {
        GAS_LOW,
        GAS_PRICE
    } = process.env;

    try {
        let value = parseFloat(req.body.value).toFixed(18);
        let fromAccount = web3.eth.accounts.wallet.add(req.body.private_key);

        let tokenContract = Contracts.tokenContract(req.body.token);
        tokenContract.methods.transfer(req.body.to, web3.utils.toWei(value, "ether"))
        .send({
            from: fromAccount.address,
            to: req.body.to,
            value: 0,
            gas: GAS_LOW,
            gasPrice: GAS_PRICE
        })
        .on('transactionHash', function (hash) {
            console.log("transaction hash: ", hash);
            web3.eth.accounts.wallet.remove(fromAccount.index);
            res.json({
                success: true,
                status: 'pending',
                tx_hash: hash,
                from: fromAccount.address,
                to: req.body.to,
                value: value
            });
            replied = true;
        })
        .on('receipt', function (receipt) {
            // console.log("receipt: ", receipt);
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            // console.log("confirmation", receipt);
        })
        .on('error', error => {
            console.log(error);
            if (!replied) {
                res.status(400).json({
                    message: String(error)
                });
            }
        }); // If a out of gas error, the second parameter is the receipt.
    } catch (ex) {
        console.log(ex);
        res.status(500).json({
            message: "Internal Error"
        });
    }
}