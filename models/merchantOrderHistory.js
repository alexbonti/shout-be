var mongoose = require('mongoose')
var Schema = mongoose.Schema;
var Config = require('../config');

var merchantOrderHistory = new Schema({
    merchantId: { type: Schema.ObjectId, ref: 'merchant' },
    orderItem: { type: String },
    credits: { type: Number },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('merchantOrderHistory', merchantOrderHistory);