var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");
var NodeMailer = require("../../lib/nodeMailer");



var createShout = function (userData, payloadData, callback) {
  var adminSummary = null;
  var teamDetails = null;
  var totalMembers = 0;
  var teamMemberIds = [];
  var numberOfPeople = 0;
  var transactionIds = [];
  var shouting = 0;
  var DATA = {};
  var dataToSend = [];
  var dataNotSent = [];
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

      if (payloadData.teamSkip == true) {
        var taskInParallel = [];
        for (var key in payloadData.userId) {
          (function (key) {
            taskInParallel.push((function (key) {
              return function (embeddedCB) {
                Service.UserService.getUser({
                  _id: payloadData.userId[key]
                }, {}, {
                  lean: true
                }, function (err, data) {
                  if (err) {
                    embeddedCB(err)
                  } else {

                    if (payloadData.credits > 0 && amount >= payloadData.credits) {
                      amount -= payloadData.credits;
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
                    }
                    else {
                      DATA.receiverId = data[0]._id;
                      DATA.receiversName = data[0].firstName;
                      DATA.receiversEmail = data[0].emailId;
                      DATA.credits = payloadData.credits;
                      DATA.message = payloadData.message;
                      dataNotSent.push(DATA);
                      DATA = {};
                    }
                    embeddedCB()
                  }
                })
              }
            })(key))
          }(key));
        }
        async.parallel(taskInParallel, function (err, result) {
          cb(null);
        });
      } else {
        cb();
      }
    },

    function (cb) {
      Service.TeamService.getTeam({ _id: payloadData.teamId }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          teamDetails = data && data[0] || null;
          cb();
        }
      })
    },



    // function (cb) {
    //   if (teamDetails) {
    //     var taskInParallel = [];
    //     for (var key in teamMemberIds) {
    //       (function (key) {
    //         taskInParallel.push((function (key) {
    //           return function (embeddedCB) {
    //             Service.UserService.getUser({
    //               _id: teamMemberIds[key]
    //             }, {}, {
    //               lean: true
    //             }, function (err, data) {
    //               if (err) {
    //                 embeddedCB(err)
    //               } else {

    //                 if (payloadData.credits > 0 && amount >= payloadData.credits) {
    //                   amount -= payloadData.credits;
    //                   DATA.adminName = userFound.fullName;
    //                   DATA.receiverId = data[0]._id;
    //                   DATA.receiversName = data[0].firstName;
    //                   DATA.receiversEmail = data[0].emailId;
    //                   DATA.credits = payloadData.credits;
    //                   DATA.message = payloadData.message;
    //                   console.log(DATA);
    //                   dataToSend.push(DATA);
    //                   DATA = {};
    //                   numberOfPeople += 1;
    //                 }
    //                 else {
    //                   DATA.receiverId = data[0]._id;
    //                   DATA.receiversName = data[0].firstName;
    //                   DATA.receiversEmail = data[0].emailId;
    //                   DATA.credits = payloadData.credits;
    //                   DATA.message = payloadData.message;
    //                   dataNotSent.push(DATA);
    //                   DATA = {};
    //                 }
    //                 embeddedCB()
    //               }
    //             })
    //           }
    //         })(key))
    //       }(key));
    //     }
    //     async.parallel(taskInParallel, function (err, result) {
    //       cb(null);
    //     });
    //   }
    //   else {
    //     cb()
    //   }
    // },


    function (cb) {
      if (payloadData.teamSkip) {
        console.log(payloadData, amount)

        shouting = payloadData.credits * numberOfPeople;
        totalshouting = adminSummary.shouting + shouting;
        recognition = adminSummary.recognition + numberOfPeople;
        dataToUpdate = {
          $set: {
            balance: amount,
            shouting: totalshouting,
            recognition: recognition
          }
        };
        Service.AdminService.updateAdminExtended({
          adminId: userData._id
        }, dataToUpdate, {}, function (err, data) {
          if (err) cb(err);
          else {

            if (dataToSend) {
              var taskInParallel = [];
              for (var key in dataToSend) {
                (function (key) {
                  taskInParallel.push((function (key) {
                    return function (embeddedCB) {
                      dataToCreate = {
                        adminId: adminSummary._id,
                        receiverId: dataToSend[key].receiverId,
                        emailId: dataToSend[key].receiversEmail,
                        credits: dataToSend[key].credits,
                        message: dataToSend[key].message,
                        date: Date.now()
                      }
                      //TODO
                      Service.ShoutTransaction.createShoutTransaction(dataToCreate, function (err, transData) {
                        if (err) {
                          embeddedCB(err)
                        } else {
                          transactionIds.push(transData._id)
                          dataToSend[key].redeemLink = process.env.REDEEM_LINK + transData._id;
                          NodeMailer.sendMail(dataToSend[key]);
                          embeddedCB()
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
            else {
              cb();
            }
          }
        })
      }
      else {
        if(amount < payloadData.credits){
          cb(ERROR.INVALID_AMOUNT);
        }
        else{
          amount -= payloadData.credits;
          shouting = payloadData.credits;
          totalshouting = adminSummary.shouting + shouting;
          recognition = adminSummary.recognition;
          dataToUpdate = {
            $set: {
              balance: amount,
              shouting: totalshouting,
              recognition: recognition
            }
          };
          Service.AdminService.updateAdminExtended({
            adminId: userData._id
          }, dataToUpdate, {}, function (err, data) {
            if (err) cb(err)
            else {
              cb();
            }
          })
        }
        
      }
    },

    function (cb) {
      if (payloadData.teamSkip) {
        console.log("JAOIDHASOIDOIAFOINEI HERE INSTEAD")
        cb();
      }
      else {
        let temp = teamDetails.credits + payloadData.credits
        console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>><<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", temp);
        Service.TeamService.updateTeam({ _id: payloadData.teamId }, { $set: { credits: temp } }, {}, function (err, data) {
          if (err) cb(err)
          else {
            cb();
          }
        })
      }
    },

    function (cb) {

      let objToSave = {};
      console.log("team")
      // var taskInParallel = [];
      // for (var key in teamDetails) {
      //   (function (key) {
      //     taskInParallel.push((function (key) {
      //       return function (embeddedCB) {
      //         totalMembers = teamDetails[key].managerIds.length + teamDetails[key].userIds.length
      //         if (payloadData.credits > 0 && amount >= (payloadData.credits * totalMembers)) {
      //           for (var x in teamDetails[key].managerIds) {
      //             teamMemberIds.push(teamDetails[key].managerIds[x]);
      //           }
      //           for (var y in teamDetails[key].userIds) {
      //             teamMemberIds.push(teamDetails[key].userIds[y]);
      //           }
      //           embeddedCB()
      //         }
      //         else {
      //           cb(ERROR.INVALID_AMOUNT)
      //         }
      //       }
      //     })(key))
      //   }(key));
      // }
      // async.parallel(taskInParallel, function (err, result) {
      //   cb(null);
      // });
      if (payloadData.teamSkip) {
        objToSave = {
          adminId: userData._id,
          teamId: payloadData.teamId,
          values: payloadData.values,
          creditsInTotal: shouting,
          creditsToEach: payloadData.credits,
          transactionIds: transactionIds,
          date: Date.now()
        }
      }
      else {
        objToSave = {
          adminId: userData._id,
          teamId: payloadData.teamId,
          values: payloadData.values,
          creditsInTotal: payloadData.credits,
          date: Date.now()
        }
      }

      Service.ShoutedTeamHistoryService.createshoutedTeamHistory(objToSave, function (err, data) {
        if (err) cb(err)
        else {
          cb();
        }
      })

    },
    // function (cb) {
    //   if (!teamDetails) {
    //     if (dataToSend.length > 0) {
    //       objToSave = {
    //         adminId: userData._id,
    //         teamId: payloadData.teamId,
    //         transactionIds: transactionIds,
    //         values: payloadData.values,
    //         creditsToEach: payloadData.credits,
    //         creditsInTotal: shouting,
    //         date: Date.now()
    //       }

    //       Service.ShoutedTeamHistoryService.createshoutedTeamHistory(objToSave, function (err, data) {
    //         if (err) cb(err)
    //         else {
    //           cb();
    //         }
    //       })
    //     }
    //     else {
    //       cb();
    //     }
    //   }
    //   else {
    //     cb();
    //   }
    // }


  ], function (err, result) {
    if (err) callback(err)
    else callback(null, {
      numberOfPeople,
      shouting,
      dataToSend,
      dataNotSent,
    })
  })
}


var getShoutTransaction = function (payloadData, callback) {
  var transData = []
  async.series([

    function (cb) {
      var criteria = {
        _id: payloadData.transactionId,
        redeemed: false
      };
      Service.ShoutTransaction.getShoutTransaction(criteria, {
        __v: 0
      }, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length == 0) {
            cb(ERROR.INVALID_COUPON)
          }
          else {
            transData = data;
            cb()
          }

        }
      })
    }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null, {
      data: transData
    })
  })
}



var redeemTransaction = function (payloadData, callback) {
  var transData = []
  var adminSummary = null;
  var shoutTransaction = null;
  async.series([
    function (cb) {
      var criteria = {
        _id: payloadData.transactionId,
        redeemed: false
      };
      Service.ShoutTransaction.getShoutTransaction(criteria, {
        __v: 0
      }, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length == 0) {
            cb(ERROR.INVALID_COUPON)
          }
          else {
            transData = data && data[0] || null;
            cb()
          }
        }
      })
    },

    function (cb) {
      if (payloadData.amount <= transData.credits) {

        var dataToPass = {
          transactionId: payloadData.transactionId,
          adminId: transData.adminId,
          credits: transData.credits,
          amountSpent: payloadData.amount,
          merchantId: payloadData.merchantId,
          orderItem: payloadData.orderItem
        }
        concludeTransaction(dataToPass, function (err, data) {
          cb();
        })
      }
      else {
        cb(ERROR.INVALID_AMOUNT)
      }
    },
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, {
      data: transData
    })
  })
}

var concludeTransaction = function (DATA, callback) {
  var adminSummary = null;

  async.series([
    function (cb) {
      Service.AdminService.getAdminExtended({ _id: DATA.adminId }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          adminSummary = data && data[0] || null;
          cb()
        }
      })
    },

    function (cb) {
      Service.MerchantService.getMerchantExtended({ merchantId: DATA.merchantId }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          merchantSummary = data && data[0] || null;
          cb()
        }
      })
    },

    function (cb) {
      Service.ShoutTransaction.updateShoutTransaction({ _id: DATA.transactionId }, { $set: { redeemed: true, merchantId: DATA.merchantId } }, {}, function (err, data) {
        if (err) cb(err)
        else {
          cb()
        }
      })
    },

    function (cb) {
      var orders = merchantSummary.orders + 1;
      var customers = merchantSummary.customers + 1;
      var earning = merchantSummary.earning + DATA.amountSpent;

      Service.MerchantService.updateMerchantExtended({ merchantId: DATA.merchantId }, { $set: { orders: orders, customers: customers, earning: earning } }, {}, function (err, data) {
        if (err) cb(err)
        else {
          cb()
        }
      })
    },

    function (cb) {
      var objToSave = {
        merchantId: DATA.merchantId,
        orderItem: DATA.orderItem,
        credits: DATA.amountSpent
      }
      Service.MerchantService.createMerchantOrder(objToSave, function (err, data) {
        if (err) cb(err)
        else cb();
      })
    },

    function (cb) {
      var amount = adminSummary.balance + DATA.credits - DATA.amountSpent;
      Service.AdminService.updateAdminExtended({ _id: DATA.adminId }, { $set: { balance: amount } }, {}, function (err, data) {
        if (err) cb(err)
        else {
          adminSummary = data;
          cb()
        }
      })
    }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null)
  })
}

var getMerchantToShout = function (payloadData, callback) {
  var transData = []
  var storeData = null;
  async.series([

    function (cb) {
      var criteria = {
        merchantId: payloadData.merchantId,
      };
      var projection = {
        merchantId: 0,
        location: 0,
        orders: 0,
        customers: 0,
        earning: 0,
        paid: 0,
        claimProcessing: 0,
        claimStatus: false,
        _id: 0,
        __v: 0,
        profilePicture: 0
      }
      Service.MerchantService.getMerchantExtended(criteria, projection, {}, function (err, data) {
        if (err) cb(err)
        else {
          storeData = data && data[0] || null;
          cb()
        }
      })
    }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null, {
      data: storeData
    })
  })
}

module.exports = {
  createShout: createShout,
  getShoutTransaction: getShoutTransaction,
  redeemTransaction: redeemTransaction,
  getMerchantToShout: getMerchantToShout
}
