"use strict";

var Models = require("../models");

var createTopUpTransaction = function (objToSave, callback) {
    new Models.TopUpTransaction(objToSave).save(callback);
};

//Get Users from DB
var getTopUpTransaction = function (criteria, projection, options, callback) {
    options.lean = true;
    Models.TopUpTransaction.find(criteria, projection, options, callback).sort({date: -1});
};

module.exports = {
    createTopUpTransaction: createTopUpTransaction,
    getTopUpTransaction: getTopUpTransaction
}