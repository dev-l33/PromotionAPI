var Web3 = require('web3');

var Contracts = require('../token/contract');

var managerContract = Contracts.managerContract;

exports.createICO = (req, res) => {
    if (!Web3.utils.isAddress(req.body.artist_address)) {
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }

    if (!req.body.token_name) {
        return res.status(422).json({
            message: "invalid token_name"
        });
    }

    if (!req.body.token_symbol) {
        return res.status(422).json({
            message: "invalid token_symbol"
        });
    }

    try {
        const HCR_ALLOCATION = '50000000';
        const ARTIST_ALLOCATION = '50000000';
        managerContract.methods.createToken(
                req.body.artist_address,
                req.body.token_name,
                req.body.token_symbol,
                Web3.utils.toWei(HCR_ALLOCATION, "ether"),
                Web3.utils.toWei(ARTIST_ALLOCATION, "ether"))
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
                // console.log("receipt: ", receipt);
            })
            .on('error', function (error) {
                console.log("error: ", error);
            }); // If there's an out of gas error the second parameter is the receipt.

        // managerContract.once('TokenIssue',
        //     function (error, event) {
        //         console.log(error);
        //         console.log(event);
        //         // res.json(event);
        //     }
        // );

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
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }

    let contracts;
    Promise.all([
            managerContract.methods.getToken(req.params.artist_address).call(),
            managerContract.methods.getCrowdsale(req.params.artist_address).call()
        ])
        .then(([tokenAddress, crowdsaleAddress]) => {
            if (tokenAddress != '0x0000000000000000000000000000000000000000' &&
                crowdsaleAddress != '0x0000000000000000000000000000000000000000' &&
                Web3.utils.isAddress(tokenAddress) &&
                Web3.utils.isAddress(crowdsaleAddress)) {
                contracts = {
                    token: tokenAddress,
                    crowdsale: crowdsaleAddress
                };
                let crowdsaleContract = Contracts.crowdsaleContract(crowdsaleAddress);
                let tokenContract = Contracts.tokenContract(tokenAddress);
                return Promise.all([
                    tokenContract.methods.totalSupply().call(),
                    crowdsaleContract.methods.weiRaised().call(),
                    crowdsaleContract.methods.tokenSold().call(),
                    crowdsaleContract.methods.weiRaisedInCurrentStage().call(),
                    crowdsaleContract.methods.tokenSoldInCurrentStage().call(),
                ]);
            } else {
                reject(new Error('Not found'));
            }
        })
        .then(([totalSupply, weiRaised, tokenSold, weiRaisedInCurrentStage, tokenSoldInCurrentStage]) => {
            console.log('token address, crontract address', contracts.token, contracts.crowdsale);
            res.json({
                success: true,
                artist: req.params.artist_address,
                token: contracts.token,
                crowdsale: contracts.crowdsale,
                eth_raised: Web3.utils.fromWei(weiRaised, 'ether'),
                token_sold: Web3.utils.fromWei(tokenSold, 'ether'),
                eth_raised_current_stage: Web3.utils.fromWei(weiRaisedInCurrentStage, 'ether'),
                token_sold_current_stage: Web3.utils.fromWei(tokenSoldInCurrentStage, 'ether'),
                total_supply: Web3.utils.fromWei(totalSupply, 'ether')
            });
        })
        .catch(ex => {
            console.log(ex);
            res.status(404).json({
                message: `The artist ${req.params.artist_address} doesn't have token`,
                artist: req.params.artist_address
            });
        });
}

exports.createStage = (req, res) => {
    if (!Web3.utils.isAddress(req.body.artist_address)) {
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }

    if (!req.body.start_date) {
        return res.status(422).json({
            message: "invalid start date"
        });
    }

    if (!req.body.end_date) {
        return res.status(422).json({
            message: "invalid end date"
        });
    }

    if (!req.body.price) {
        return res.status(422).json({
            message: "invalid price"
        });
    }

    if (!req.body.supply) {
        return res.status(422).json({
            message: "invalid supply"
        });
    }

    try {
        managerContract.methods.setStage(
                req.body.artist_address,
                req.body.start_date,
                req.body.end_date,
                req.body.supply,
                req.body.price)
            .send()
            .on('transactionHash', hash => {
                console.log('Transaction Hash: ', hash);
                res.json({
                    success: true,
                    status: 'pending',
                    tx_hash: hash,
                    artist_address: req.body.artist_address,
                    start_date: req.body.start_date,
                    end_date: req.body.end_date,
                    supply: req.body.supply,
                    price: req.body.price
                });
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log("confirmation: ", confirmationNumber, receipt);
            })
            .on('receipt', function (receipt) {
                // console.log("receipt: ", receipt);
            })
            .on('error', function (error) {
                console.log("error: ", error);
            }); // If there's an out of gas error the second parameter is the receipt.

        console.log("Transaction was sent");
    } catch (ex) {
        console.log(ex);
        res.status(500).json({
            message: ex.message
        });
    }
}

exports.updateStage = (req, res) => {
    if (!Web3.utils.isAddress(req.body.artist_address)) {
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }

    if (!req.body.start_date) {
        return res.status(422).json({
            message: "invalid start date"
        });
    }

    if (!req.body.end_date) {
        return res.status(422).json({
            message: "invalid end date"
        });
    }
    let replied = false;
    managerContract.methods.updateCrowdsaleTime(
            req.body.artist_address,
            req.body.start_date,
            req.body.end_date)
        .send()
        .on('transactionHash', hash => {
            console.log('Transaction Hash: ', hash);
            res.json({
                success: true,
                status: 'pending',
                tx_hash: hash,
                artist_address: req.body.artist_address,
                start_date: req.body.start_date,
                end_date: req.body.end_date
            });
            replied = true;
        })
        .on('confirmation', function (confirmationNumber, receipt) {
            console.log("confirmation: ", confirmationNumber, receipt);
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

exports.allocateTokens = (req, res) => {
    if (!Web3.utils.isAddress(req.body.artist_address)) {
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }

    if (!Web3.utils.isAddress(req.body.beneficiary_address)) {
        return res.status(422).json({
            message: "invalid beneficiary_address"
        });
    }

    if (!req.body.amount) {
        return res.status(422).json({
            message: "invalid amount"
        });
    }

    try {
        managerContract.methods.allocate(
                req.body.artist_address,
                req.body.beneficiary_address,
                parseInt(req.body.amount))
            .send()
            .on('transactionHash', hash => {
                console.log('Transaction Hash: ', hash);
                res.json({
                    success: true,
                    status: 'pending',
                    tx_hash: hash,
                    artist_address: req.body.artist_address,
                    beneficiary_address: req.body.beneficiary_address,
                    amount: req.body.amount
                });
            })
            .on('confirmation', function (confirmationNumber, receipt) {
                console.log("confirmation: ", confirmationNumber, receipt);
            })
            .on('receipt', function (receipt) {
                // console.log("receipt: ", receipt);
            })
            .on('error', function (error) {
                console.log("error: ", error);
            }); // If there's an out of gas error the second parameter is the receipt.

        console.log("Transaction was sent");
    } catch (ex) {
        console.log(ex);
        res.status(500).json({
            message: ex.message
        });
    }
}

exports.tokenBalance = (req, res) => {
    if (!Web3.utils.isAddress(req.params.contract)) {
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }

    if (!Web3.utils.isAddress(req.params.account)) {
        return res.status(422).json({
            message: "invalid artist_address"
        });
    }
    try {
        let tokenContract = Contracts.tokenContract(req.params.contract);
        tokenContract.methods.balanceOf(req.params.account).call()
            .then(result => {
                console.log(`Check balance for ${req.params.account} at ${req.params.contract} : ${result}`)
                res.json({
                    success: true,
                    accont: req.params.account,
                    token: req.params.contract,
                    balance: result
                });
            })
            .error(error => {
                res.status(500).json({
                    message: error
                });
            });
    } catch (ex) {
        console.log(ex);
        res.status(500).json({
            message: "Internal Error"
        });
    }
}

exports.getEthUsdPrice = (req, res) => {
    managerContract.methods.ethusd().call()
    .then(result => {
        res.json({
            success: true,
            ethusd: result / 100
        });
    })
    .catch(ex => {
        res.status(500).json({
            message: ex
        });
    });
}