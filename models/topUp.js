var mongoose = require('mongoose')
var SchemaTypes = mongoose.Schema.Types;
var Schema = mongoose.Schema;
var Config = require('../config');



var topUpTransaction = new Schema({
    adminId : { type : Schema.ObjectId , ref : 'admin'},
    credit: { type: Number },
    date: { type: Date },
    note: { type: String }
});

module.exports = mongoose.model('topUpTransaction', topUpTransaction);