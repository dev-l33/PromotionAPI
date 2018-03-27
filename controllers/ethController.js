var web3 = require('../ethereum');

exports.transactionReceipt = (req, res) => {
    if (!req.params.tx_hash) {
        return res.status(422).json({
            message: "invalid transaction hash"
        });
    }

    web3.eth.getTransactionReceipt(req.params.tx_hash)
    .then(receipt => {
        let result = {
            success: true,
            status: web3.utils.hexToNumber(receipt.status),
            from: receipt.from,
            to: receipt.to,
            tx_hash: receipt.transactionHash
        };
        if (receipt.status == 1) {
            result.data = web3.utils.fromWei(web3.utils.hexToNumberString(receipt.logs[0].data), "ether");
        }

        res.json(result);
    })
    .catch(ex => {
        // console.log(ex);
        res.status(404).json({
            message: 'Invalid Transaction Hash'
        });
    });
}