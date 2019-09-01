var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");
var NodeMailer = require("../../lib/nodeMailer");



var shout = function (userData, payloadData, callback) {
  var adminSummary = null;
  var numberOfPeople = 0;
  var shouting = 0;
  var DATA = {};
  var dataToSend = [];
  var shout = {};
  var userSummaries = null;
  var userSummary = null;
  var dataToUpdate = null;
  var amount = null;
  async.series([
    function (cb) {
      var criteria = {
        _id: userData._id
      };
      Service.AdminService.getAdmin(criteria, {
        password: 0
      }, {}, function (err, data) {
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
      }, {
        password: 0,
        __v: 0,
        createdAt: 0
      }, {}, function (err, data) {
        if (err) cb(err)
        else {
          adminSummary = data && data[0] || null;
          amount = adminSummary.balance;
          cb()
        }
      })
    },


    function (cb) {
      projection = {
        firstLogin: 0,
        emailVerified: 0,
        isBlocked: 0,
        firstName: 0,
        lastName: 0,
        countryCode: 0,
        password: 0,
        registrationDate: 0,
        codeUpdatedAt: 0,
        __v: 0,
        accessToken: 0,
      }

      if (payloadData.userId) {
        var taskInParallel = [];
          for (var key in payloadData.userId) {
              (function (key) {
                  taskInParallel.push((function (key) {
                      return function (embeddedCB) {
                          //TODO
                          Service.UserService.getUser({ _id: payloadData.userId[key]}, {}, { lean : true} , function(err, data){
                            if(err)
                            {
                              embeddedCB(err)
                            }
                            else{
                              
                              if (payloadData.credits > 0 && amount >= payloadData.credits) {
                                amount -=  payloadData.credits;
                                DATA.adminName = userFound.fullName;
                                DATA.receiverId = data[0]._id;
                                DATA.receiversName = data[0].firstName;
                                DATA.receiversEmail = data[0].emailId;
                                DATA.credits = payloadData.credits;
                                DATA.message = payloadData.message;
                                console.log(DATA);
                                dataToSend.push(DATA);
                                DATA = {};
                                numberOfPeople += 1;
                                embeddedCB()
                              } else {
                                cb(ERROR.INVALID_AMOUNT)
                              }
                            }
                          })
                      }
                  })(key))
              }(key));
          }
          async.parallel(taskInParallel, function (err, result) {
              cb(null);
          });
      }
      else{
        cb();
      } 
    },
      
    

    function (cb) {
      console.log(payloadData, amount)

      shouting = payloadData.credits*numberOfPeople;
      totalshouting = adminSummary.shouting+ shouting;
      recognition = adminSummary.recognition + numberOfPeople;
      dataToUpdate = {
        $set: {
          balance: amount,
          shouting : totalshouting,
          recognition : recognition
        }
      };
      Service.AdminService.updateAdminExtended({
        adminId: userData._id
      }, dataToUpdate, {}, function (err, data) {
        if (err) cb(err);
        else{
          dataToSend.forEach(element => {
            dataToCreate = {
              adminId : adminSummary._id,
              receiverId : element.receiverId,
              emailId : element.receiversEmail,
              credits : element.credits,
              message : element.message
            }
            Service.ShoutTransaction.createShoutTransaction(dataToCreate,function(err, transData){
              if(err) cb(err)
              else{
                // shout = transData;
                element.redeemLink = "Somelink/"+transData._id;
                console.log(element.redeemLink)
                console.log("data : " , element)
                NodeMailer.sendMail(element);
              }
            })
            
          });
          cb();
        }  
      })
    },
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, {numberOfPeople,shouting,dataToSend})
  })
}


var getShoutTransaction = function(payloadData, callback) {
  var transData = []
  async.series([

    function (cb) {
      var criteria = {
        _id : payloadData.transactionId
      };
      Service.ShoutTransaction.getShoutTransaction(criteria, { __v: 0 }, {}, function (err, data) {
        if (err) cb(err)
        else {
            transData = data;
            cb()
        }
      })
    }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: transData })
  })
}
module.exports = {
  shout: shout,
  getShoutTransaction : getShoutTransaction
}
