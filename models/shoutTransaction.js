var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../config');

var shoutTransaction = new Schema({
    adminId: { type: Schema.ObjectId, ref: 'admin' },
    receiverId: { type: Schema.ObjectId, ref: 'user' },
    emailId: { type: String, trim: true, required: true },
    credits: { type: Number },
    message: { type: String },
    redeemed: { type: Boolean, default: false },
    date: { type: Date, defauly: Date.now },
    merchantId: { type: Schema.ObjectId, ref: 'merchant' },
});

module.exports = mongoose.model('shoutTransaction', shoutTransaction);