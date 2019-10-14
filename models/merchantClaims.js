var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Config = require('../config');

var merchantClaims = new Schema({
    merchantId: { type: Schema.ObjectId, ref: 'merchant' },
    status: { type: String, default: 'Processing' },
    amount: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('merchantClaims', merchantClaims);