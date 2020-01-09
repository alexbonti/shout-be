/**
 * Created by Navit on 15/11/16.
 */
var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");
var Nodemailer = require("../../lib/nodeMailer");

var adminLogin = function (payloadData, callback) {
  payloadData.emailId = payloadData.emailId.toLowerCase();
  var userFound = false;
  var accessToken = null;
  var successLogin = false;
  async.series(
    [
      function (cb) {
        //verify email address
        if (!UniversalFunctions.verifyEmailFormat(payloadData.emailId)) {
          cb(ERROR.INVALID_EMAIL_FORMAT);
        } else {
          cb();
        }
      },
      function (cb) {
        var criteria = {
          emailId: payloadData.emailId
        };

        var option = {
          lean: true
        };
        Service.AdminService.getAdmin(criteria, {}, option, function (
          err,
          result
        ) {
          if (err) {
            cb(err);
          } else {
            userFound = (result && result[0]) || null;
            cb();
          }
        });
      },
      function (cb) {
        //validations
        if (!userFound) {
          cb(
            UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR.EMAIL_NO_EXIST
          );
        } else {
          if (
            userFound &&
            userFound.password !=
            UniversalFunctions.CryptData(payloadData.password)
          ) {
            cb(ERROR.INCORRECT_PASSWORD);
          } else if (userFound.isBlocked == true) {
            cb(ERROR.ACCOUNT_BLOCKED);
          } else {
            successLogin = true;
            cb();
          }
        }
      },
      function (cb) {
        var criteria = {
          emailId: payloadData.emailId
        };
        var projection = {
          password: 0
        };
        var option = {
          lean: true
        };
        Service.AdminService.getAdmin(criteria, projection, option, function (
          err,
          result
        ) {
          if (err) {
            cb(err);
          } else {
            userFound = (result && result[0]) || null;
            cb();
          }
        });
      },
      function (cb) {
        if (successLogin) {
          var tokenData = {
            id: userFound._id,
            type:
              UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
          };
          TokenManager.setToken(tokenData, function (err, output) {
            if (err) {
              cb(err);
            } else {
              if (output && output.accessToken) {
                accessToken = output && output.accessToken;
                cb();
              } else {
                cb(error.IMP_ERROR);
              }
            }
          });
        } else {
          cb(error.IMP_ERROR);
        }
      }
    ],
    function (err, data) {
      if (err) {
        return callback(err);
      } else {
        return callback(null, {
          accessToken: accessToken,
          adminDetails: userFound
        });
      }
    }
  );
};

var accessTokenLogin = function (userData, callback) {
  var appVersion;
  var userdata = {};
  var userFound = null;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData._id
        };
        Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (
          err,
          data
        ) {
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
        appVersion = {
          latestIOSVersion: 100,
          latestAndroidVersion: 100,
          criticalAndroidVersion: 100,
          criticalIOSVersion: 100
        };
        cb(null);
      }
    ],
    function (err, user) {
      if (!err)
        return callback(null, {
          accessToken: userdata.accessToken,
          adminDetails: UniversalFunctions.deleteUnnecessaryUserData(userFound),
          appVersion: appVersion
        });
      else callback(err);
    }
  );
};

var createAdmin = function (userData, payloadData, callback) {
  var newAdmin;
  var adminSummary = [];
  async.series(
    [
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
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },
      function (cb) {
        var criteria = {
          emailId: payloadData.emailId
        }
        Service.AdminService.getAdmin(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            if (data.length > 0) cb(ERROR.USERNAME_EXIST)
            else cb()
          }
        })
      },

      function (cb) {
        Service.AdminService.getAdminExtended({
          adminId: userData._id
        }, { password: 0, __v: 0, createdAt: 0 }, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            console.log("!!!!!!!!!!!!!!!!!!!!", adminSummary)
            cb()
          }
        })
      },

      function (cb) {
        if (adminSummary.companyId == null || adminSummary.companyId == 'undefined') {
          cb(ERROR.INVALID_COMPANY_ID)
        }
        else {
          cb();
        }
      },

      function (cb) {
        Service.CompanyService.getCompany({ _id: adminSummary.companyId }, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            var companyDetails = data && data[0] || null;
            if (companyDetails.values.length == 0) {
              cb(ERROR.INVALID_COMPANY_DETAILS)
            }
            else cb()
          }
        })
      },

      function (cb) {
        payloadData.initialPassword = UniversalFunctions.generateRandomString();
        payloadData.password = UniversalFunctions.CryptData(payloadData.initialPassword);
        payloadData.userType = Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN;
        Service.AdminService.createAdmin(payloadData, function (err, data) {
          if (err) cb(err)
          else {
            var extData = { adminId: data._id, companyId: adminSummary.companyId }
            Service.AdminService.createAdminExteded(extData, function (err, extendedData) {
              if (err) cb(err)
              else {
                Nodemailer.sendAccountMail(payloadData.emailId, payloadData.initialPassword);
                cb()
              }
            })
          }
        })
      }

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, {});
    }
  );
};

var getAdmin = function (userData, callback) {
  var adminList = []
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
            if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
            else cb();
          }
        }
      });
    },
    function (cb) {
      Service.AdminService.getAdmin({
        userType: Config.APP_CONSTANTS.DATABASE.USER_ROLES.ADMIN
      }, { password: 0, __v: 0, createdAt: 0 }, {}, function (err, data) {
        if (err) cb(err)
        else {
          adminList = data;
          cb()
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: adminList })
  })
}

var blockUnblockAdmin = function (userData, payloadData, callback) {
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
            if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
            else cb();
          }
        }
      });
    },
    function (cb) {
      Service.AdminService.getAdmin({ _id: payloadData.adminId }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length == 0) cb(ERROR.USER_NOT_FOUND)
          else cb()
        }
      })
    },
    function (cb) {
      var criteria = {
        _id: payloadData.adminId
      }
      var dataToUpdate = {
        $set: {
          isBlocked: payloadData.block
        }
      }
      Service.AdminService.updateAdmin(criteria, dataToUpdate, {}, function (err, data) {
        if (err) cb(err)
        else cb()
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null)
  })
}

var createUser = function (userData, payloadData, callback) {
  var newUserData;
  var adminDetails;
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
            cb()
          }
        }
      });
    },
    function (cb) {
      if (userFound) {
        Service.AdminService.getAdminExtended({ adminId: userFound._id }, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminDetails = data && data[0] || null;
            cb();
          }
        })
      }
    },
    function (cb) {
      Service.UserService.getUser({ emailId: payloadData.emailId }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length != 0) cb(ERROR.USER_ALREADY_REGISTERED)
          else cb()
        }
      })
    },
    function (cb) {
      if (adminDetails.companyId == null || adminDetails.companyId == 'undefined') {
        cb(ERROR.INVALID_COMPANY_ID)
      }
      else {
        cb();
      }
    },
    function (cb) {
      payloadData.initialPassword = UniversalFunctions.generateRandomString();
      payloadData.password = UniversalFunctions.CryptData(payloadData.initialPassword);
      payloadData.emailVerified = true;
      payloadData.userType = Config.APP_CONSTANTS.DATABASE.USER_ROLES.USER,
        Service.UserService.createUser(payloadData, function (err, data) {
          if (err) cb(err)
          else {
            newUserData = data;
            Nodemailer.sendAccountMail(payloadData.emailId, payloadData.initialPassword);
            cb()
          }
        })
    },
    function (cb) {
      if (newUserData) {
        Service.UserService.createUserExtended({ userId: newUserData._id, companyId: adminDetails.companyId }, function (err, data) {
          if (err) cb(err)
          else {
            cb();
          }
        })
      }
    },
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { userData: UniversalFunctions.deleteUnnecessaryUserData(newUserData) })
  })
}

var getUser = function (userData, callback) {
  var userList = []
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
            if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
            else cb()
          }
        }
      });
    },
    function (cb) {
      var projection = {
        password: 0,
        accessToken: 0,
        OTPCode: 0,
        code: 0,
        codeUpdatedAt: 0,
        __v: 0,
        registrationDate: 0
      }
      Service.UserService.getUser({}, projection, {}, function (err, data) {
        if (err) cb(err)
        else {
          userList = data;
          cb()
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: userList })
  })
}

var blockUnblockUser = function (userData, payloadData, callback) {
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
            if (userFound.isBlocked == true) cb(ERROR.ACCOUNT_BLOCKED)
            else cb()
          }
        }
      });
    },
    function (cb) {
      Service.UserService.getUser({ _id: payloadData.userId }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length == 0) cb(ERROR.USER_NOT_FOUND)
          else cb()
        }
      })
    },
    function (cb) {
      var criteria = {
        _id: payloadData.userId
      }
      var dataToUpdate = {
        $set: {
          isBlocked: payloadData.block
        }
      }
      Service.UserService.updateUser(criteria, dataToUpdate, {}, function (err, data) {
        if (err) cb(err)
        else cb()
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null)
  })
}

var changePassword = function (userData, payloadData, callbackRoute) {
  var oldPassword = UniversalFunctions.CryptData(payloadData.oldPassword);
  var newPassword = UniversalFunctions.CryptData(payloadData.newPassword);
  var customerData;
  async.series(
    [
      function (cb) {
        var query = {
          _id: userData._id
        };
        var options = { lean: true };
        Service.AdminService.getAdmin(query, {}, options, function (err, data) {
          if (err) {
            cb(err);
          } else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              customerData = (data && data[0]) || null;
              if (customerData.isBlocked) cb(ERROR.ACCOUNT_BLOCKED);
              else cb();
            }
          }
        });
      },
      function (callback) {
        var query = {
          _id: userData._id
        };
        var projection = {
          password: 1,
          firstLogin: 1
        };
        var options = { lean: true };
        Service.AdminService.getAdmin(query, projection, options, function (
          err,
          data
        ) {
          if (err) {
            callback(err);
          } else {
            customerData = (data && data[0]) || null;
            if (customerData == null) {
              callback(ERROR.NOT_FOUND);
            } else {
              if (payloadData.skip == false) {
                if (
                  data[0].password == oldPassword &&
                  data[0].password != newPassword
                ) {
                  callback(null);
                } else if (data[0].password != oldPassword) {
                  callback(ERROR.WRONG_PASSWORD);
                } else if (data[0].password == newPassword) {
                  callback(ERROR.NOT_UPDATE);
                }
              }
              else callback(null)
            }
          }
        });
      },
      function (callback) {
        var dataToUpdate;
        if (payloadData.skip == true && customerData.firstLogin == false) {
          dataToUpdate = { $set: { firstLogin: true }, $unset: { initialPassword: 1 } };
        }
        else if (payloadData.skip == false && customerData.firstLogin == false) {
          dataToUpdate = { $set: { password: newPassword, firstLogin: true }, $unset: { initialPassword: 1 } };
        }
        else {
          dataToUpdate = { $set: { password: newPassword } };
        }
        var condition = { _id: userData._id };
        Service.AdminService.updateAdmin(condition, dataToUpdate, {}, function (
          err,
          user
        ) {
          if (err) {
            callback(err);
          } else {
            if (!user || user.length == 0) {
              callback(ERROR.NOT_FOUND);
            } else {
              callback(null);
            }
          }
        });
      }
    ],
    function (error, result) {
      if (error) {
        return callbackRoute(error);
      } else {
        return callbackRoute(null);
      }
    }
  );
}

var logoutAdmin = function (userData, callbackRoute) {
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData._id
        };
        Service.AdminService.getAdmin(criteria, {}, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              cb();
            }
          }
        });
      },
      function (callback) {
        var condition = { _id: userData._id };
        var dataToUpdate = { $unset: { accessToken: 1 } };
        Service.AdminService.updateAdmin(condition, dataToUpdate, {}, function (
          err,
          result
        ) {
          if (err) {
            callback(err);
          } else {
            callback();
          }
        });
      }
    ],
    function (error, result) {
      if (error) {
        return callbackRoute(error);
      } else {
        return callbackRoute(null);
      }
    }
  );
}


var getAdminExtendedProfile = function (userData, callback) {
  var adminSummary = null;
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
          adminSummary = data;
          cb()
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: adminSummary })
  })
}

var getAdminBalance = function (userData, callback) {
  var adminBalance = null;
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
          adminBalance = data[0].balance;
          cb()
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { balance: adminBalance })
  })
}

var createSuperAdmin = function (userData, payloadData, callback) {
  var newAdmin;
  var dataToPass = {};
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData._id,
          emailId: process.env.SHOUT_OWNER_EMAIL
        };
        Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },
      function (cb) {
        var criteria = {
          emailId: payloadData.emailId
        }
        Service.AdminService.getAdmin(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            if (data.length > 0) cb(ERROR.USERNAME_EXIST)
            else cb()
          }
        })
      },
      function (cb) {
        payloadData.initialPassword = UniversalFunctions.generateRandomString();
        payloadData.password = UniversalFunctions.CryptData(payloadData.initialPassword);
        payloadData.userType = Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN;
        Service.AdminService.createAdmin(payloadData, function (err, data) {
          if (err) cb(err)
          else {
            newAdmin = data;
            completeSuperAdminSignUp(newAdmin._id, function (err, data) {
              if (err) cb(err)
              else {
                Nodemailer.sendAccountMail(payloadData.emailId, payloadData.initialPassword);
                cb();
              }
            })
          }
        })
      }
    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { adminDetails: UniversalFunctions.deleteUnnecessaryUserData(newAdmin) });
    }
  );
};


var completeSuperAdminSignUp = function (DATA, callback) {
  var adminSummary = null;
  var companyDetails = null;
  async.series([
    function (cb) {
      Service.AdminService.createAdminExteded({ adminId: DATA }, function (err, data) {
        if (err) cb(err)
        else {
          adminSummary = data;
          cb()
        }
      })
    },

    function (cb) {
      Service.CompanyService.createCompany({ superAdminId: DATA }, function (err, data) {
        if (err) cb(err)
        else {
          companyDetails = data
          cb()
        }
      })
    },

    function (cb) {
      Service.AdminService.updateAdminExtended({ adminId: DATA }, { $set: { companyId: companyDetails._id } }, {}, function (err, data) {
        if (err) cb(err)
        else {
          cb()
        }
      })
    }
  ], function (err, result) {
    if (err) callback(err)
    else callback(null)
  })
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var createSuperAdminInsideCompany = function (userData, payloadData, callback) {
  var newAdmin;
  var adminSummary;
  var dataToPass = {};
  async.series(
    [
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
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var criteria = {
          adminId: userData._id
        }
        Service.AdminService.getAdminExtended(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            cb();
          }
        })
      },

      function (cb) {
        var criteria = {
          emailId: payloadData.emailId
        }
        Service.AdminService.getAdmin(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            if (data.length > 0) cb(ERROR.USERNAME_EXIST)
            else cb()
          }
        })
      },

      function (cb) {
        payloadData.initialPassword = UniversalFunctions.generateRandomString();
        payloadData.password = UniversalFunctions.CryptData(payloadData.initialPassword);
        payloadData.userType = Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN;
        Service.AdminService.createAdmin(payloadData, function (err, data) {
          if (err) cb(err)
          else {
            dataToPass.newAdmin = data;
            dataToPass.companyId = adminSummary.companyId;
            completeSuperAdminSignUpInsideCompany(dataToPass, function (err, data) {
              if (err) cb(err)
              else {
                Nodemailer.sendAccountMail(payloadData.emailId, payloadData.initialPassword);
                cb();
              }
            })
          }
        })
      }
    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { adminDetails: UniversalFunctions.deleteUnnecessaryUserData(dataToPass.newAdmin) });
    }
  );
};


var completeSuperAdminSignUpInsideCompany = function (DATA, callback) {
  async.series([
    function (cb) {
      Service.AdminService.createAdminExteded({ adminId: DATA.newAdmin, companyId: DATA.companyId }, function (err, data) {
        if (err) cb(err)
        else {
          adminSummary = data;
          cb()
        }
      })
    },
  ], function (err, result) {
    if (err) callback(err)
    else callback(null)
  })
}

var deleteSuperAdminInsideCompany = function (userData, payloadData, callback) {
  var adminSummary;
  var superAdminId;
  var dataToPass = {};
  async.series(
    [
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
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var criteria = {
          adminId: userData._id
        }
        Service.AdminService.getAdminExtended(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            cb();
          }
        })
      },

      function (cb) {
        var criteria = {
          _id: adminSummary.companyId
        }
        Service.CompanyService.getCompany(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            superAdminId = data && data[0].superAdminId || null;
            cb()
          }
        })
      },

      function (cb) {
        if (String(superAdminId) == String(userData._id)) {
          Service.AdminService.deleteAdmin({ _id: payloadData.adminId }, function (err, data) {
            if (err) cb(err)
            else cb();
          })
        }
        else {
          cb(ERROR.PRIVILEGE_MISMATCH);
        }
      }

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null);
    }
  );
};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var getAdminTeamShoutedHistory = function (userData, callback) {
  var history = null;
  var mostRecognised = [];
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
      var path = "teamId";
      var select = "teamName";
      var populate = {
        path: path,
        match: {},
        select: select,
        options: {
          lean: true
        }
      };
      var projection = {
        __v: 0,
      };

      Service.ShoutedTeamHistoryService.getPopulatedTeamDetails({
        adminId: userData._id,
      }, projection, populate, { date: -1 }, {}, function (err, data) {
        if (err) {
          cb(err);
        } else {
          history = data
          cb();
        }
      });
    },
  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: history })
  })
}

var getMostRecognisedTeam = function (userData, callback) {
  var history = null;
  var mostRecognised = [];
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
      criteria = [
        {
          $match: {
            adminId: userFound._id,
          }
        }, {
          $group: {
            _id: '$teamId',
            total: {
              $sum: '$creditsInTotal'
            },
          },
        },
        {
          $project: {
            teams: {
              $gte: ['$total', 80]
            }
          }
        }
      ]
      Service.ShoutedTeamHistoryService.getAggregateShoutedTeamHistory(criteria, function (err, data) {
        if (err) cb(err)
        else {
          console.log(data)
          history = data;
          history = _.where(history, { teams: true })
          cb();
        }
      })
    },

    function (cb) {
      if (history.length != 0) {
        var taskInParallel = [];
        for (var key in history) {
          (function (key) {
            taskInParallel.push((function (key) {
              return function (embeddedCB) {

                Service.TeamService.getTeam({ adminId: userFound._id, _id: history[key]._id }, {}, {}, function (err, data) {
                  if (err) cb(err)
                  else {
                    var temp = {};
                    temp._id = data[0]._id;
                    temp.teamName = data[0].teamName
                    mostRecognised.push(temp);
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
        cb()
      }
    }
    // function (cb) {
    //   var obj;
    //   Math.max(Math.max.apply(Math, history.map(function (o) { return o.total, obj = o; })))
    //   mostRecognised._id = obj._id;
    //   mostRecognised.total = obj.total
    //   cb();
    // },

    // function (cb) {
    //   Service.TeamService.getTeam({ _id: mostRecognised._id }, {}, {}, function (err, data) {
    //     if (err) cb(err)
    //     else {
    //       mostRecognised.teamName = data[0].teamName;
    //       cb();
    //     }
    //   })
    // }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: mostRecognised })
  })
}

var getTeamNeedsAttention = function (userData, callback) {
  var missingIds = null;
  var teamsData;
  var teamIds = [];
  var allTeamIds = [];
  var newTeamIds = [];
  var teamIdsNotFound = [];
  var mostRecognised = {};
  var teamNeedsAttention = [];
  var teams = [];
  var temp = {};
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
      Service.TeamService.getTeam({ adminId: userFound._id, isActive: true }, {}, {}, function (err, data) {
        if (err) cb(err)
        else {
          if (data.length == 0) {
            cb(null)
          }
          else {
            for (x in data) { teamIds.push(data[x]._id) }
            _.map(teamIds, function (e) { allTeamIds.push(String(e)) })
            console.log("!>!>!>!>", teamIds)
            cb();
          }

        }
      })
    },

    function (cb) {
      if (teamIds.length != 0) {
        criteria = [
          {
            $match: {
              adminId: userFound._id
            }
          }, { "$group": { "_id": null, "ids": { "$addToSet": "$teamId" } } },
          { "$project": { "missingIds": { "$setDifference": [teamIds, "$ids"] } } }
        ]
        Service.ShoutedTeamHistoryService.getAggregateShoutedTeamHistory(criteria, function (err, data) {
          if (err) cb(err)
          else {
            if (data != undefined && data.length != 0) {
              missingIds = data && data[0].missingIds || null
              _.map(missingIds, function (e) { teamIdsNotFound.push(String(e)) })
              newTeamIds = _.difference(allTeamIds, teamIdsNotFound)
              cb();
            }
            else {
              cb(null)
            }
          }
        })
      }
      else {
        cb(null)
      }
    },

    function (cb) {
      if (newTeamIds) {
        var taskInParallel = [];
        for (var key in newTeamIds) {
          (function (key) {
            taskInParallel.push((function (key) {
              return function (embeddedCB) {
                criteria = {
                  adminId: userFound._id,
                  teamId: newTeamIds[key],
                  isActive: true,
                  date: { $gte: new Date(Date.now() - 1000 * 86400 * 45) }
                }
                Service.ShoutedTeamHistoryService.getShoutedTeamHistory(criteria, {}, {}, function (err, data) {
                  if (err) cb(err)
                  else {
                    if (data.length == 0) {
                      teamNeedsAttention.push(newTeamIds[key])
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
      }
      else {
        cb()
      }
    },

    function (cb) {
      _.map(teamIdsNotFound, function (e) { teamNeedsAttention.push(e) })
      console.log(teamNeedsAttention)
      if (teamNeedsAttention) {
        var taskInParallel = [];
        for (var key in teamNeedsAttention) {
          (function (key) {
            taskInParallel.push((function (key) {
              return function (embeddedCB) {
                Service.TeamService.getTeam({ _id: teamNeedsAttention[key] }, {}, {}, function (err, data) {
                  if (err) cb(err)
                  else {
                    temp._id = teamNeedsAttention[key]
                    temp.teamName = data[0].teamName;
                    teams.push(temp);
                    temp = {}
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
        cb()
      }
    }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: teams })
  })
}

var getShoutingTrends = function (userData, callback) {
  var history = null;
  var trends = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
      let previousYear = (new Date().getFullYear()) - 1
      let currentYear = new Date('01/01/' + previousYear);
      criteria = [
        {
          $match: {
            adminId: userFound._id,
            date: {
              $gt: currentYear
            }
          }
        },
        {
          $project: {
            month: {
              $month: "$date"
            },
            _id: 0
          }
        }
      ]
      Service.ShoutedTeamHistoryService.getAggregateShoutedTeamHistory(criteria, function (err, data) {
        if (err) cb(err)
        else {
          console.log(data)
          history = data;
          cb();
        }
      })
    },
    function (cb) {
      if (history) {
        var months = [];
        months = _.map(history, function (e) {
          return e.month
        })
        _.map(months, function (x) {
          switch (x) {
            case 1: trends[0] += 1
              break;
            case 2: trends[1] += 1
              break;
            case 3: trends[2] += 1
              break;
            case 4: trends[3] += 1
              break;
            case 5: trends[4] += 1
              break;
            case 6: trends[5] += 1
              break;
            case 7: trends[6] += 1
              break;
            case 8: trends[7] += 1
              break;
            case 9: trends[8] += 1
              break;
            case 10: trends[9] += 1
              break;
            case 11: trends[10] += 1
              break;
            case 12: trends[11] += 1
              break;
            default: trends;
          }
        })
        cb();
      }
      else {
        cb();
      }
    }

  ], function (err, result) {
    if (err) callback(err)
    else callback(null, { data: trends })
  })
}

var checkSuperAdminForRights = function (userData, callback) {
  var company;
  var adminSummary;
  var adminRights;
  async.series(
    [
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
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var criteria = {
          adminId: userData._id
        }
        Service.AdminService.getAdminExtended(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            cb();
          }
        })
      },
      function (cb) {
        Service.CompanyService.getCompany({ _id: adminSummary.companyId }, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            company = data && data[0] || null;
            cb()
          }
        })
      },
      function (cb) {
        if (String(company.superAdminId) == String(userData._id)) {
          adminRights = true;
        }
        else {
          adminRights = false;
        }
        cb();
      }

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { adminRights: adminRights });
    }
  );
};

var adminsInsideCompany = function (userData, callback) {
  var adminSummary;
  var adminDetails;
  async.series(
    [
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
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var criteria = {
          adminId: userData._id
        }
        Service.AdminService.getAdminExtended(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            cb();
          }
        })
      },
      function (cb) {
        var path = "adminId";
        var select = "fullName emailId isBlocked phoneNumber countryCode";
        var populate = {
          path: path,
          match: {},
          select: select,
          options: {
            lean: true
          }
        };
        var projection = {
          __v: 0,
          balance: 0,
          shouting: 0,
          recognition: 0
        };

        Service.AdminService.getPopulatedAdmins({
          companyId: adminSummary.companyId,
        }, projection, populate, {}, {}, function (err, data) {
          if (err) {
            cb(err);
          } else {
            adminDetails = data;
            cb();
          }
        });
      },

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { adminDetails: adminDetails });
    }
  );
};

var usersInsideCompany = function (userData, callback) {
  var adminSummary;
  var userDetails;
  async.series(
    [
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
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var criteria = {
          adminId: userData._id
        }
        Service.AdminService.getAdminExtended(criteria, {}, {}, function (err, data) {
          if (err) cb(err)
          else {
            adminSummary = data && data[0] || null;
            cb();
          }
        })
      },
      function (cb) {
        var path = "userId";
        var select = "firstName lastName emailId isBlocked phoneNumber countryCode";
        var populate = {
          path: path,
          match: {},
          select: select,
          options: {
            lean: true
          }
        };
        var projection = {
          __v: 0,
          credits: 0,
        };

        Service.UserService.getPopulatedUsers({
          companyId: adminSummary.companyId,
        }, projection, populate, {}, {}, function (err, data) {
          if (err) {
            cb(err);
          } else {
            userDetails = data;
            cb();
          }
        });
      },

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { userDetails: userDetails });
    }
  );
};

var getMerchantProfile = function (userData, payloadData, callback) {
  var merchantDetails;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData._id,
          emailId: process.env.SHOUT_OWNER_EMAIL
        };
        Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var criteria = {
          merchantId: payloadData.merchantId
        }
        var projection = {
          __v: 0,
        };
        Service.MerchantService.getMerchantExtended(criteria, projection, {}, function (err, data) {
          if (err) cb(err)
          else {
            if (data.length == 0) cb(ERROR.DEFAULT)
            else {
              merchantDetails = data && data[0] || null;
              cb()
            }
          }
        })
      }
    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { data: merchantDetails });
    }
  );
};

var adminsInsideCompanies = function (userData, payloadData, callback) {
  var adminSummary;
  var adminDetails;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData._id,
          emailId: process.env.SHOUT_OWNER_EMAIL
        };
        Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var path = "adminId";
        var select = "fullName emailId isBlocked phoneNumber countryCode";
        var populate = {
          path: path,
          match: {},
          select: select,
          options: {
            lean: true
          }
        };
        var projection = {
          __v: 0,
          balance: 0,
          shouting: 0,
          recognition: 0
        };

        Service.AdminService.getPopulatedAdmins({
          companyId: payloadData.companyId,
        }, projection, populate, {}, {}, function (err, data) {
          if (err) {
            cb(err);
          } else {
            adminDetails = data;
            cb();
          }
        });
      },

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { adminDetails: adminDetails });
    }
  );
};

var usersInsideCompanies = function (userData, payloadData, callback) {
  var adminSummary;
  var userDetails;
  async.series(
    [
      function (cb) {
        var criteria = {
          _id: userData._id,
          emailId: process.env.SHOUT_OWNER_EMAIL
        };
        Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (err, data) {
          if (err) cb(err);
          else {
            if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
            else {
              userFound = (data && data[0]) || null;
              if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
              else cb();
            }
          }
        });
      },

      function (cb) {
        var path = "userId";
        var select = "firstName lastName emailId isBlocked phoneNumber countryCode";
        var populate = {
          path: path,
          match: {},
          select: select,
          options: {
            lean: true
          }
        };
        var projection = {
          __v: 0,
          credits: 0,
        };

        Service.UserService.getPopulatedUsers({
          companyId: payloadData.companyId,
        }, projection, populate, {}, {}, function (err, data) {
          if (err) {
            cb(err);
          } else {
            userDetails = data;
            cb();
          }
        });
      },

    ],
    function (err, result) {
      if (err) return callback(err);
      else return callback(null, { userDetails: userDetails });
    }
  );
};
module.exports = {
  adminLogin: adminLogin,
  accessTokenLogin: accessTokenLogin,
  createAdmin: createAdmin,
  getAdmin: getAdmin,
  blockUnblockAdmin: blockUnblockAdmin,
  createUser: createUser,
  getUser: getUser,
  blockUnblockUser: blockUnblockUser,
  changePassword: changePassword,
  logoutAdmin: logoutAdmin,
  getAdminExtendedProfile: getAdminExtendedProfile,
  getAdminBalance: getAdminBalance,
  createSuperAdmin: createSuperAdmin,
  getAdminTeamShoutedHistory: getAdminTeamShoutedHistory,
  getMostRecognisedTeam: getMostRecognisedTeam,
  getTeamNeedsAttention: getTeamNeedsAttention,
  getShoutingTrends: getShoutingTrends,
  createSuperAdminInsideCompany: createSuperAdminInsideCompany,
  deleteSuperAdminInsideCompany: deleteSuperAdminInsideCompany,
  checkSuperAdminForRights: checkSuperAdminForRights,
  adminsInsideCompany: adminsInsideCompany,
  usersInsideCompany: usersInsideCompany,
  getMerchantProfile: getMerchantProfile,
  adminsInsideCompanies: adminsInsideCompanies,
  usersInsideCompanies: usersInsideCompanies
};