var mongoose = require('mongoose') 
require('mongoose-double')(mongoose);
var SchemaTypes = mongoose.Schema.Types;
var Schema = mongoose.Schema;
var Config = require('../config');



var adminExtended = new Schema({
    adminId : { type : Schema.ObjectId , ref : 'admin'},
    balance : { type : Number , default : 0},//{ type : SchemaTypes.Decimal128 , default : 0},
    shouting : { type : Number , default : 0},//{ type : SchemaTypes.Decimal128 , default : 0},
    recognition : { type : Number , default : 0},
    teamShoutedHistory : [
        {
            teamName : {type : String },//{type : Schema.ObjectId , ref : 'teams'},
            credits : { type : Number , default : 0},//{type : SchemaTypes.Decimal128},
            date : {type : Date}
        }
    ],
    topUpHistory : [
        {
            credit : {type : SchemaTypes.Decimal128},
            date : {type : Date},
            note : {type : String}
        }
    ]
});

module.exports = mongoose.model('adminExtended', adminExtended);