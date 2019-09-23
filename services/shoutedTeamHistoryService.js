"use strict";

var Models = require("../models");

var updateshoutedTeamHistory = function (criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.ShoutedTeamHistory.findOneAndUpdate(criteria, dataToSet, options, callback);
};

var createshoutedTeamHistory = function (objToSave, callback) {
    new Models.ShoutedTeamHistory(objToSave).save(callback);
};


var getShoutedTeamHistory = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.ShoutedTeamHistory.find(criteria, projection, options, callback);
};

var getAggregateShoutedTeamHistory = function (criteria, callback) {
    Models.ShoutedTeamHistory.aggregate(criteria, callback);
};

var getPopulatedTeamDetails = function (
    criteria,
    projection,
    populate,
    sortOptions,
    setOptions,
    callback
) {
    console.log("ok........", criteria, projection, populate);
    Models.ShoutedTeamHistory.find(criteria)
        .select(projection)
        .populate(populate)
        .sort(sortOptions)
        .exec(function (err, result) {
            callback(err, result);
        });
};

module.exports = {
    updateshoutedTeamHistory: updateshoutedTeamHistory,
    createshoutedTeamHistory: createshoutedTeamHistory,
    getShoutedTeamHistory: getShoutedTeamHistory,
    getPopulatedTeamDetails: getPopulatedTeamDetails,
    getAggregateShoutedTeamHistory: getAggregateShoutedTeamHistory
};
