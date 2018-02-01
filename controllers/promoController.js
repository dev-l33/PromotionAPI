const PromoCode = require('../models/promoCodeModel');
const mongoose = require('mongoose');
const randomstring = require('randomstring');

exports.getInfo = (req, res) => {
    let code = req.params.code;
    PromoCode.findByCode(code, (err, promoCode) => {
        if (err) throw err;
        if (promoCode) {
            return res.json({
                success: true,
                result: {
                    code: promoCode.code,
                    createdAt: promoCode.createdAt,
                    isActivated: promoCode.isActivated,
                    activatedAt: promoCode.activatedAt
                }
            });
        } else {
            return res.status(404).json({
                message: 'invalid code',
                code: 404
            });
        }
    });
}

exports.create = (req, res) => {
    if (!req.body.refId) {
        return res.status(400).json({
            message: "invalid referal ID",
            code: 100
        });
    }

    if (!req.body.type) {
        return res.status(400).json({
            message: "invalid type",
            code: 100
        });
    }

    let code = randomstring.generate(16);
    console.log("code is ", code);
    // create new Promotion Code
    let promoCode = new PromoCode({
        refId: req.body.refId,
        code: code,
        type: req.body.type
    });

    promoCode.save(err => {
        if (err) throw err;
        return res.json({
            success: true,
            result: {
                code: promoCode.code
            }
        });
    });
}

exports.activate = (req, res) => {
    if (!req.params.code) {
        return res.status(404).json({
            message: "invalid promo code",
            code: 404
        });
    }

    PromoCode.findByCode(req.params.code, (err, promoCode) => {
        if (err) throw err;
        if (promoCode) {
            PromoCode.findByIdAndUpdate(promoCode._id, {
                    isActivated: true,
                    activatedAt: Date.now()
                }, {
                    new: true
                },
                (err, updatedObject) => {
                    if (err) throw err;
                    return res.json({
                        success: true,
                        result: {
                            code: updatedObject.code
                        }
                    });
                });
        } else {
            return res.status(404).json({
                message: 'invalid code',
                code: 404
            });
        }
    });
}

exports.checkAuth = (req, res, next) => {
    if (req.authorized) {
        next();
    } else {
        return res.status(403).json({
            message: 'Unauthorized request',
            code: 403
        });
    }
}