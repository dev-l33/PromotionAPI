var web3 = require('../ethereum');

var managerABI = require("./managerABI.json");
var tokenABI = require("./tokenABI.json");
var crowdsaleABI = require("./crowdsaleABI.json");

const {
    MANAGER_CONTRACT_ADDRESS: managerAddress,
    GAS,
    GAS_PRICE
} = process.env;

const options = {
    from: '0xbd900d44661e554a05415a43fd79025521a973a3', // default from address
    gasPrice: GAS_PRICE,
    gas: GAS
}

exports.managerContract = new web3.eth.Contract(managerABI, managerAddress, options);

exports.crowdsaleContract = (address) => new web3.eth.Contract(crowdsaleABI, address, options);
exports.tokenContract = (address) => new web3.eth.Contract(tokenABI, address, options);