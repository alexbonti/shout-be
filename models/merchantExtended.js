var mongoose = require('mongoose')
var SchemaTypes = mongoose.Schema.Types;
var Schema = mongoose.Schema;
var Config = require('../config');

var merchantExtended = new Schema({
    merchantId : { type : Schema.ObjectId , ref : 'merchant'},
    storeNumber: { type: Number },
    profilePicture: {
        image: { type: String },
        thumbnail: { type: String }
    },
    merchantId: { type: Schema.ObjectId, ref: 'merchant' },
    storeName: { type: String },
    location: {
        type: {
            type: String,
            enum: ['Point'],
        },
        coordinates: {
            type: [Number],
        }
    },
    phoneNumber: { type: Number },
    orders: { type: Number, default: 0 },
    customers: { type: Number, default: 0 },
    earning: { type: Number, default: 0 },
    paid: { type: Number, default: 0 },
});

merchantExtended.index( { location : "2dsphere" } )
module.exports = mongoose.model('merchantExtended', merchantExtended);