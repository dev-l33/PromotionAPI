var web3 = require('../ethereum');

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
        res.status(500).json({
            message: ex.message
        });
    }
}