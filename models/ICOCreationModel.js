const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types } = Schema;

const ICOCreation = new Schema({
    tokenTx: Types.String,
    tokenAddress: Types.String,
    crowdsaleTx: Types.String,
    crowdsaleAddress: Types.String,
    createdAt: { type: Types.Date, default: Date.now }
});

// find 
ICOCreation.statics.findByTx = function(tx, cb) {
    return this.findOne({ tokenTx: tx }, cb);
};

module.exports = mongoose.model('ico_creation', ICOCreation);
