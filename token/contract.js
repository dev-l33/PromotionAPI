var web3 = require('../ethereum');

var managerABI = require("./managerABI.json");
var tokenABI = require("./tokenABI.json");

const {
    MANAGER_CONTRACT_ADDRESS: managerAddress
} = process.env;

managerContract = new web3.eth.Contract(managerABI, managerAddress, {
    from: '0xbd900d44661e554a05415a43fd79025521a973a3', // default from address
    gasPrice: '50000000000',
    gas: 4000000
});

module.exports = managerContract;