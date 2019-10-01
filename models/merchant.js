var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../config');

var merchant = new Schema({
    emailId: { type: String, unique: true, sparse: true },
    fullName: { type: String },
    password: { type: String, required: true },
    accessToken: { type: String, select: false },
    initialPassword: { type: String },
    firstLogin: { type: Boolean, default: false },
    createdAt: { type: Date, required: true, default: Date.now },
    isBlocked: { type: Boolean, default: false, required: true },
});

module.exports = mongoose.model('merchant', merchant);