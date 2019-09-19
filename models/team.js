var mongoose = require('mongoose')
var SchemaTypes = mongoose.Schema.Types;
var Schema = mongoose.Schema;
var Config = require('../config');



var team = new Schema({
    teamName: { type: String, trim: true },
    managerIds: [
        { type: Schema.ObjectId, ref: 'user' }
    ],
    userIds: [
        { type: Schema.ObjectId, ref: 'user' }
    ],
    adminId: { type: Schema.ObjectId, ref: 'admin' },
    location: { type: String, trim: true },
    companyId: { type: Schema.ObjectId, ref: 'company' },
    isActive: { type: Boolean, default: true}
});

module.exports = mongoose.model('team', team);