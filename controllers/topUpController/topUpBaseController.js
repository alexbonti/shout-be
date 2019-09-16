var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");



var topUpAdmin = function (userData, payloadData, callback) {
  var adminSummary = null;
  var dataToUpdate = null;
  var amount = null;
  var transaction;
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
        adminId: userData._id
      }, { password: 0, __v: 0, createdAt: 0 }, {}, function (err, data) {
        if (err) cb(err)
        else {
          adminSummary = data && data[0] || null;
          cb()
        }
      })
    },
    function (cb) {
      if (payloadData.amount > 0) {
        amount = payloadData.amount + adminSummary.balance;
        cb()
      }
      else {
        cb(ERROR.INVALID_AMOUNT)
      }
    },
    function (cb) {
      dataToUpdate = {
        $set: {
          balance: amount,
        },
      };
      Service.AdminService.updateAdminExtended({ adminId: userData._id }, dataToUpdate, {}, function (err, data) {
        if (err) cb(err);
        else cb();
      })
    },

    function (cb) {
      var objToSave = {
        adminId: userData._id,
        credit: payloadData.amount,
        date: Date.now(),
        note: "Manual Top up"
      }

      Service.TopUpService.createTopUpTransaction(objToSave, function (err, data) {
        if (err) cb(err)
        else {
          transaction = data && data[0] || null;
          cb()
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: transaction })
  })
}

var getTopUpTransaction = function (userData, callback) {

  var transaction;
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
      Service.TopUpService.getTopUpTransaction({ adminId: userData._id }, { __v: 0 }, {}, function (err, data) {
        if (err) cb(err)
        else {
          transaction = data;
          cb();
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: transaction })
  })
}

module.exports = {
  topUpAdmin: topUpAdmin,
  getTopUpTransaction: getTopUpTransaction
}