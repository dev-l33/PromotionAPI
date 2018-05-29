var web3 = require('../ethereum');

var managerABI = require("./managerABI.json");
var tokenABI = require("./tokenABI.json");
var crowdsaleABI = require("./crowdsaleABI.json");
var hcrCrowdsaleABI = require("./hcrCrowdsaleABI.json");

const {
    MANAGER_CONTRACT_ADDRESS: managerAddress,
    GAS,
    GAS_PRICE,
    DEFAULT_ACCOUNT
} = process.env;

const options = {
    from: DEFAULT_ACCOUNT, // default from address
    gasPrice: GAS_PRICE,
    gas: GAS
}

exports.options = options;

exports.managerContract = new web3.eth.Contract(managerABI, managerAddress, options);

exports.crowdsaleContract = (address) => new web3.eth.Contract(crowdsaleABI, address, options);
exports.newCrowdsaleContract = new web3.eth.Contract(crowdsaleABI);
exports.tokenContract = (address) => new web3.eth.Contract(tokenABI, address, options);
exports.newTokenContract = new web3.eth.Contract(tokenABI);
exports.hcrCrowdsaleContract = (address) => new web3.eth.Contract(hcrCrowdsaleABI, address, options);