var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var Config = require('../config');

var shoutedTeamHistory = new Schema({
    adminId: { type: Schema.ObjectId, ref: 'admin' },
    teamId: { type: Schema.ObjectId, ref: 'team' },
    transactionIds: [
        { type: Schema.ObjectId, ref: 'shoutTransaction' }
    ],
    values: [
        { type: String }
    ],
    date: { type: Date, defauly: Date.now },
    creditsToEach: { type: Number },
    creditsInTotal: { type: Number }
});

module.exports = mongoose.model('shoutedTeamHistory', shoutedTeamHistory);