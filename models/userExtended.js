var mongoose = require('mongoose')
var SchemaTypes = mongoose.Schema.Types;
var Schema = mongoose.Schema;
var Config = require('../config');



var userExtended = new Schema({
    userId: { type: Schema.ObjectId, ref: 'user' },
    credits: { type: Number, default: 0 },
    companyId: { type: Schema.ObjectId, ref: 'company' },
});

module.exports = mongoose.model('userExtended', userExtended);