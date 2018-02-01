const mongoose = require('mongoose');

const { Schema } = mongoose;
const { Types } = Schema;

const PromoCode = new Schema({
    refId: Types.Number,
    code: Types.String,
    type: Types.String,
    isActivated: { type: Types.Boolean, default: false},
    activatedAt: Types.Date,
    createdAt: { type: Types.Date, default: Date.now }
});

// find code
PromoCode.statics.findByCode = function(code, cb) {
    return this.findOne({ code: code }, cb);
};

module.exports = mongoose.model('promo_code', PromoCode);
