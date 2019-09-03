 "use strict";

 var Models = require("../models");
 
 var updateShoutTransaction = function(criteria, dataToSet, options, callback) {
   options.lean = true;
   options.new = true;
   Models.ShoutTransaction.findOneAndUpdate(criteria, dataToSet, options, callback);
 };
  
 var createShoutTransaction = function(objToSave, callback) {
   new Models.ShoutTransaction(objToSave).save(callback);
 };

 
 var getShoutTransaction = function(criteria, projection, options, callback) {
   options.lean = true;
   Models.ShoutTransaction.find(criteria, projection, options, callback);
 };
 
 module.exports = {
    updateShoutTransaction: updateShoutTransaction,
    createShoutTransaction: createShoutTransaction,
    getShoutTransaction: getShoutTransaction,
 };
 