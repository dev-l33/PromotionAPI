var Web3 = require("web3");
// connect ETH node
const {
  ETHEREUM_NODE_URL: ethNode
} = process.env;

web3 = new Web3(new Web3.providers.HttpProvider(ethNode));
web3.eth.getCoinbase().then(console.log);

module.exports = web3;