var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");



var topUpAdmin = function (userData,payloadData, callback) {
    var adminSummary = null;
    var dataToUpdate = null;
    var amount = null;
    async.series([
      function (cb) {
        var criteria = {
          _id: userData._id
        };
        Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              cb();
            }
          }
        });
      },
      function (cb) {
        Service.AdminService.getAdminExtended({
          adminId : userData._id
        }, { password: 0, __v: 0, createdAt: 0 }, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            cb()
          }
        })
      },
      function(cb){
          if( payloadData.amount > 0){
            amount = payloadData.amount + adminSummary.balance;
            cb()
          }
          else{
              cb(ERROR.INVALID_AMOUNT)
          }
      },
      function(cb){
          console.log(payloadData , amount)
          var history = [{
            credit : payloadData.amount,
            date : Date.now(),
            note : "Manual Top up"
          }]
          dataToUpdate = { 
            $set : { 
              balance : amount,
            },
            $addToSet : {
              topUpHistory : history
            }
          };
          Service.AdminService.updateAdminExtended({adminId : userData._id}, dataToUpdate , {}, function(err,data){
              if(err) cb(err);
              else cb();
          })
      }
      
    ], function (err, result) {
      if (err) callback(err)
      else callback(null, {})
    })
  }

  module.exports = {
    topUpAdmin : topUpAdmin
  }