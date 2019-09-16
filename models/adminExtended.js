var mongoose = require('mongoose') 
var SchemaTypes = mongoose.Schema.Types;
var Schema = mongoose.Schema;
var Config = require('../config');



var adminExtended = new Schema({
    adminId : { type : Schema.ObjectId , ref : 'admin'},
    balance : { type : Number , default : 0},
    shouting : { type : Number , default : 0},
    companyId : { type : Schema.ObjectId , ref : 'company'},
    recognition : { type : Number , default : 0},
});

module.exports = mongoose.model('adminExtended', adminExtended);