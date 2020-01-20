"use strict";

var Models = require("../models");

var updateTeam = function(criteria, dataToSet, options, callback) {
    options.lean = true;
    options.new = true;
    Models.Team.findOneAndUpdate(criteria, dataToSet, options, callback);
  };
  //Insert Team in DB
  var createTeam = function(objToSave, callback) {
    new Models.Team(objToSave).save(callback);
  };
  //Delete Team in DB
  var deleteTeam = function(criteria, callback) {
    Models.Team.findOneAndRemove(criteria, callback);
  };
  
  //Get Teams from DB
  var getTeam = function(criteria, projection, options, callback) {
    options.lean = true;
    Models.Team.find(criteria, projection, options, callback);
  };

  var getPopulatedUserDetails = function(
    criteria,
    projection,
    populate,
    sortOptions,
    setOptions,
    callback
  ) {
    console.log("ok........", criteria, projection, populate);
    Models.Team.find(criteria)
      .select(projection)
      .populate(populate)
      .sort(sortOptions)
      .exec(function(err, result) {
        callback(err, result);
      });
  };

  var getAggregateTeam = function(criteria, callback) {
    Models.Team.aggregate(criteria, callback);
  };
  module.exports = {
      updateTeam : updateTeam,
      createTeam : createTeam,
      deleteTeam : deleteTeam,
      getTeam : getTeam,
      getPopulatedUserDetails : getPopulatedUserDetails,
      getAggregateTeam: getAggregateTeam
  }
