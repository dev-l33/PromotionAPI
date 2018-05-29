var Web3 = require('web3');
const ICOCreation = require('../models/ICOCreationModel');
const mongoose = require('mongoose');

var Contracts = require('../token/contract');
var Bytecode = require('../token/bytecode');

var managerContract = Contracts.managerContract;


// send token from coinbase account after token deployed
function transferToken(tokenAddress, toAddress, value) {
    let tokenContract = Contracts.tokenContract(tokenAddress);
    tokenContract.methods.transfer(toAddress, web3.utils.toWei(value, "ether"))
    .send({
        from: process.env.DEFAULT_ACCOUNT,
        value: 0,
        gas: process.env.GAS_LOW,
        gasPrice: process.env.GAS_PRICE
    })
    .then(receipt => {
        console.log(`Transfer ${value} from ${process.env.DEFAULT_ACCOUNT} to ${toAddress} - ${receipt.transactionHash}`);
    });
}

exports.createICO = (req, res) => {

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

    if (!Web3.utils.isAddress(req.body.artist_account)) {
        return res.status(422).json({
            message: "invalid artist trading account"
        });
    }

    if (!Web3.utils.isAddress(req.body.artist_trading_account)) {
        return res.status(422).json({
            message: "invalid artist trading account"
        });
    }

    if (!Web3.utils.isAddress(req.body.hcr_trading_account)) {
        return res.status(422).json({
            message: "invalid artist trading account"
        });
    }

    if (!Web3.utils.isAddress(req.body.admin_account)) {
        return res.status(422).json({
            message: "invalid artist trading account"
        });
    }

    let ico = new ICOCreation();
    let tokenContract = Contracts.newTokenContract;
    let crowdsaleContract = Contracts.newCrowdsaleContract;
    tokenContract.deploy({
        data: Bytecode.token,
        arguments: [req.body.token_name, req.body.token_symbol]
    })
    .send(Contracts.options)
    .on('transactionHash', hash => {
        console.log('Token Deploy Tx Hash: ', hash);
        ico.tokenTx = hash;
        ico.save(err => {
            if (err) throw err;
        });
        
        res.json({
            success: true,
            status: 'pending',
            tx_hash: hash,
            token_name: req.body.token_name,
            token_symbol: req.body.token_symbol
        });
    })
    .on('receipt', function (receipt) {
        // console.log("receipt: ", receipt);
    })

    .on('error', function (error) {
        console.log("error: ", error);
        return res.status(500).json({
            message: error
        });
    }) // If there's an out of gas error the second parameter is the receipt.

    .then(function(newContractInstance) {
        ico.tokenAddress = newContractInstance.options.address;
        ico.save(err => {
            if (err) throw err;
        });

        crowdsaleContract.deploy({
            data: Bytecode.crowdsale,
            arguments: [process.env.WALLET_ADDRESS, newContractInstance.options.address]
        })
        .send(Contracts.options)
        .on('transactionHash', hash => {
            console.log('Crowdsale Deploy Tx Hash: ', hash);
            ico.crowdsaleTx = hash;
            ico.save(err => {
                if (err) throw err;
            });
        })
        .on('receipt', function (receipt) {
            // console.log("receipt: ", receipt);
        })

        .on('error', function (error) {
            console.log("error: ", error);
            return res.status(500).json({
                message: error
            });
        }) // If there's an out of gas error the second parameter is the receipt.

        .then(function(newContractInstance) {
            ico.crowdsaleAddress = newContractInstance.options.address;
            ico.save(err => {
                if (err) throw err;
            });

            // token distribution
            // Artist Trading Account 48,000,000
            // HCR Trading Account 14,000,000
            // Artist Account 50,000,000
            // Joshua Hunt Account 50,000,000 + 38,000,000(1st Sale Release)
            transferToken(ico.tokenAddress, req.body.artist_trading_account, '48000000');
            transferToken(ico.tokenAddress, req.body.hcr_trading_account, '14000000');
            transferToken(ico.tokenAddress, req.body.artist_account, '50000000');
            transferToken(ico.tokenAddress, req.body.admin_account, '88000000');
        });

    });
}

exports.getICOCreationStatus = (req, res) => {
    if (!req.params.tx_hash) {
        return res.status(422).json({
            message: "invalid tx hash"
        });
    }

    ICOCreation.findOneByTx(req.params.tx_hash, function(error, ico) {
        if (error) {
            return res.status(500).json({
                message: String(error)
            });
        }
        if (ico && ico.tokenAddress && ico.crowdsaleAddress) {
            return res.json({
                success: true,
                token_tx: ico.tokenTx,
                crowdsale_tx: ico.crowdsaleTx,
                token_address: ico.tokenAddress,
                crowdsale_address: ico.crowdsaleAddress
            });
        } else {
            return res.status(404).json({
                message: 'Not Found'
            });
        }
    });
}

exports.getContractInfo = (req, res) => {
    if (!Web3.utils.isAddress(req.body.token_address)) {
        return res.status(422).json({
            message: "invalid token contract address"
        });
    }

    if (!Web3.utils.isAddress(req.body.crowdsale_address)) {
        return res.status(422).json({
            message: "invalid crowdsale contract address"
        });
    }

    // for hcr ico
    if (req.body.token_address == process.env.HCR_TOKEN_ADDRESS) {
        const {
            HCR_TOKEN_ADDRESS: tokenAddress,
            HCR_CROWDSALE_ADDRESS: crowdsaleAddress
        } = process.env;

        let crowdsaleContract = Contracts.crowdsaleContract(crowdsaleAddress);
        let tokenContract = Contracts.tokenContract(tokenAddress);
        Promise.all([
            tokenContract.methods.totalSupply().call(),
            crowdsaleContract.methods.weiRaised().call(),
            crowdsaleContract.methods.tokenSold().call()
        ])
        .then(([totalSupply, weiRaised, tokenSold]) => {
            return res.json({
                success: true,
                artist: req.params.artist_address,
                token: tokenAddress,
                crowdsale: crowdsaleAddress,
                eth_raised: Web3.utils.fromWei(weiRaised, 'ether'),
                token_sold: Web3.utils.fromWei(tokenSold, 'ether'),
                eth_raised_current_stage: Web3.utils.fromWei(weiRaised, 'ether'),
                token_sold_current_stage: Web3.utils.fromWei(tokenSold, 'ether'),
                total_supply: Web3.utils.fromWei(totalSupply, 'ether')
            });
        })
        .catch(ex => {
            console.log(ex);
            return res.status(404).json({
                message: `The artist ${req.params.artist_address} doesn't have token`,
                artist: req.params.artist_address
            });
        });
    } else {
        // normal ICO
        let crowdsaleContract = Contracts.crowdsaleContract(req.body.crowdsale_address);
        let tokenContract = Contracts.tokenContract(req.body.token_address);
        Promise.all([
            tokenContract.methods.totalSupply().call(),
            crowdsaleContract.methods.weiRaised().call(),
            crowdsaleContract.methods.tokenSold().call(),
            crowdsaleContract.methods.weiRaisedInCurrentStage().call(),
            crowdsaleContract.methods.tokenSoldInCurrentStage().call()
        ])
        .then(([totalSupply, weiRaised, tokenSold, weiRaisedInCurrentStage, tokenSoldInCurrentStage]) => {
            return res.json({
                success: true,
                artist: req.params.artist_address,
                token: req.body.token_address,
                crowdsale: req.body.crowdsale_address,
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
                message: `Not Found Token:${req.params.token_address}, Crowdsale: ${req.params.crowdsale_address}`,
                token_address: req.params.token_address,
                crowdsale_address: req.params.crowdsale_address,
            });
        });
    }
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

    // for hcr ico
    if (req.body.artist_address == '0xe8e067Ec9D408C932524982aa78c76C2E7152D1C') {
        const {
            HCR_CROWDSALE_ADDRESS: crowdsaleAddress
        } = process.env;

        let contract = Contracts.hcrCrowdsaleContract(crowdsaleAddress);
        try {
            contract.methods.allocate(req.body.beneficiary_address, Web3.utils.toWei(req.body.amount, 'ether'))
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
        } catch (ex) {
            console.log(ex);
            res.status(500).json({
                message: ex.message
            });
        }
    // normal artist ICO
    } else {
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