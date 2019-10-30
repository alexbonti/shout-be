var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");
var Nodemailer = require("../../lib/nodeMailer");

var merchantLogin = function (payloadData, callback) {
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
                Service.MerchantService.getMerchant(criteria, {}, option, function (
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
                Service.MerchantService.getMerchant(criteria, projection, option, function (
                    err,
                    result
                ) {
                    if (err) {
                        cb(err);
                    } else {
                        userFound = (result && result[0]) || null;
                        console.log("user: ", userFound)
                        cb();
                    }
                });
            },
            function (cb) {
                if (successLogin) {
                    console.log("success login", successLogin)
                    var tokenData = {
                        id: userFound._id,
                        type: UniversalFunctions.CONFIG.APP_CONSTANTS.DATABASE.USER_ROLES.MERCHANT
                    };
                    TokenManager.setToken(tokenData, function (err, output) {
                        if (err) {
                            cb(err);
                        } else {
                            if (output && output.accessToken) {
                                accessToken = output && output.accessToken;
                                cb();
                            } else {
                                console.log("token ", accessToken)
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
                    MerchantDetails: userFound
                });
            }
        }
    );
};

var createMerchant = function (userData, payloadData, callback) {
    var newMerchant;
    var MerchantSummary = [];
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
                            if ((userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERMADMIN) && userFound.emailId != "anirudh.m0009@gmail.com") cb(ERROR.PRIVILEGE_MISMATCH);
                            else cb();
                        }
                    }
                });
            },
            function (cb) {
                var criteria = {
                    emailId: payloadData.emailId
                }
                Service.MerchantService.getMerchant(criteria, {}, {}, function (err, data) {
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
                Service.MerchantService.createMerchant(payloadData, function (err, data) {
                    if (err) cb(err)
                    else {
                        var extData = { merchantId: data._id }
                        Service.MerchantService.createMerchantExteded(extData, function (err, extendedData) {
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

var getMerchant = function (userData, callback) {
    var MerchantList = []
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
                        if ((userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) && userFound.emailId != "anirudh.m0009@gmail.com") cb(ERROR.PRIVILEGE_MISMATCH);
                        else cb();
                    }
                }
            });
        },
        function (cb) {
            Service.MerchantService.getMerchant({
            }, { password: 0, __v: 0, createdAt: 0, firstLogin: 0, initialPassword: 0 }, {}, function (err, data) {
                if (err) cb(err)
                else {
                    MerchantList = data;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: MerchantList })
    })
}

var blockUnblockMerchant = function (userData, payloadData, callback) {
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
                        if ((userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) && userFound.emailId != "anirudh.m0009@gmail.com") cb(ERROR.PRIVILEGE_MISMATCH);
                        else cb();
                    }
                }
            });
        },
        function (cb) {
            Service.MerchantService.getMerchant({ _id: payloadData.MerchantId }, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data.length == 0) cb(ERROR.USER_NOT_FOUND)
                    else cb()
                }
            })
        },
        function (cb) {
            var criteria = {
                _id: payloadData.MerchantId
            }
            var dataToUpdate = {
                $set: {
                    isBlocked: payloadData.block
                }
            }
            Service.MerchantService.updateMerchant(criteria, dataToUpdate, {}, function (err, data) {
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
                Service.MerchantService.getMerchant(query, {}, options, function (err, data) {
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
                Service.MerchantService.getMerchant(query, projection, options, function (
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
                Service.MerchantService.updateMerchant(condition, dataToUpdate, {}, function (
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


var logoutMerchant = function (userData, callbackRoute) {
    async.series(
        [
            function (cb) {
                var criteria = {
                    _id: userData._id
                };
                Service.MerchantService.getMerchant(criteria, {}, {}, function (err, data) {
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
                Service.MerchantService.updateMerchant(condition, dataToUpdate, {}, function (
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

var getMerchantExtendedProfile = function (userData, callback) {
    var MerchantSummary = null;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            };
            Service.MerchantService.getMerchant(criteria, { password: 0 }, {}, function (err, data) {
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
            Service.MerchantService.getMerchantExtended({
                merchantId: userData._id
            }, { password: 0, __v: 0, createdAt: 0 }, {}, function (err, data) {
                if (err) cb(err)
                else {
                    MerchantSummary = data;
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: MerchantSummary })
    })
}


var getOrdersHistory = function (userData, callback) {
    var history = null;
    var mostRecognised = [];
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            };
            Service.MerchantService.getMerchant(criteria, { password: 0 }, {}, function (err, data) {
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
            Service.MerchantService.getMerchantOrders({ merchantId: userData._id }, { __v: 0, merchantId: 0 }, {}, function (err, data) {
                if (err) cb(err)
                else {
                    history = data;
                    cb();
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: history })
    })
}

var getClaimStatus = function (userData, callback) {
    var transaction;
    var claims;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            };
            Service.MerchantService.getMerchant(criteria, { password: 0 }, {}, function (err, data) {
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
            Service.MerchantService.getMerchantClaims({ merchantId: userData._id }, { __v: 0, merchantId: 0 }, {}, function (err, data) {
                if (err) cb(err)
                else {
                    claims = data;
                    cb();
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: claims })
    })
}

var updateMerchantProfile = function (userData, payloadData, callback) {
    var adminSummary = null;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            };
            Service.MerchantService.getMerchant(criteria, { password: 0 }, {}, function (err, data) {
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

            var dataToUpdate = {
                storeName: payloadData.storeName,
                storeNumber: payloadData.storeNumber,
                profilePicture: {
                    image: payloadData.profilePicture,
                    thumbnail: payloadData.profilePicture
                },
                location: {
                    type: "Point",
                    coordinates: [(parseFloat(payloadData.long)), (parseFloat(payloadData.lat))]
                }
            }
            Service.MerchantService.updateMerchantExtended({ merchantId: userData._id }, dataToUpdate, {}, function (err, data) {
                if (err) cb(err)
                else {
                    adminSummary = data;
                    console.log("here<<<<<<<<<<<<<<<<<<<>>>>>>>>>>>>>>>>>>>>>")
                    cb()
                }
            })
        }
    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: adminSummary })
    })
}

var createClaim = function (userData, payloadData, callback) {
    var transaction;
    var merchantSummary;
    var claims;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id
            };
            Service.MerchantService.getMerchant(criteria, { password: 0 }, {}, function (err, data) {
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
            var criteria = {
                merchantId: userData._id
            };
            Service.MerchantService.getMerchantExtended(criteria, { password: 0 }, {}, function (err, data) {
                if (err) cb(err);
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
                    else {
                        merchantSummary = (data && data[0]) || null;
                        cb();
                    }
                }
            });
        },

        function (cb) {
            Service.MerchantService.getMerchantClaims({ merchantId: userData._id, status: 'Processing' }, {}, {}, function (err, data) {
                if (err) cb(err)
                else {
                    if (data == null || data.length == 0) {
                        cb();
                    }
                    else {
                        cb(ERROR.DEFAULT)
                    }
                }
            })
        },
        function (cb) {
            if (payloadData.amount > merchantSummary.earning) {
                cb(ERROR.INVALID_AMOUNT)
            }
            else {
                var objToSave = {
                    merchantId: userData._id,
                    amount: payloadData.amount
                }
                Service.MerchantService.createMerchantClaims(objToSave, function (err, data) {
                    if (err) cb(err)
                    else cb();
                })
            }
        },

        function (cb) {
            var newEarning = merchantSummary.earning - payloadData.amount;
            Service.MerchantService.updateMerchantExtended({ merchantId: userData._id }, { $set: { earning: newEarning } }, {}, function (err, data) {
                if (err) cb(err)
                else cb();
            })
        }

    ], function (err, result) {
        if (err) callback(err)
        else callback(null)
    })
}

var confirmMerchantClaim = function (userData, payloadData, callback) {
    var adminSummary = null;
    var merchantSummary;
    async.series([
        function (cb) {
            var criteria = {
                _id: userData._id,
                emailId: "anirudh.m0009@gmail.com"
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
            var criteria = {
                merchantId: payloadData.merchantId
            };
            Service.MerchantService.getMerchantExtended(criteria, { password: 0 }, {}, function (err, data) {
                if (err) cb(err);
                else {
                    if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
                    else {
                        merchantSummary = (data && data[0]) || null;
                        cb();
                    }
                }
            });
        },

        function (cb) {
            console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>", merchantSummary);
            Service.MerchantService.updateMerchantClaims({ _id: payloadData.claimId, status: 'Processing' }, { $set: { status: 'Transferred', date: Date.now() } }, {}, function (err, data) {
                if (err) cb(err)
                else cb();
            })
        },

        function (cb) {
            var paid = merchantSummary.paid + payloadData.amount;
            Service.MerchantService.updateMerchantExtended({ merchantId: payloadData.merchantId }, { $set: { paid: paid } }, {}, function (err, data) {
                if (err) cb(err)
                else cb();
            })
        }

    ], function (err, result) {
        if (err) callback(err)
        else callback(null)
    })
}

var merchantLocationByKeyword = function (payloadData, callback) {
    var merchantSummary;
    async.series([
        function (cb) {
            var regex = new RegExp('' + payloadData.name.toLowerCase(), 'i')
            console.log(regex)
            var criteria = {
                storeName: regex
            };
            var projection = {
                orders: 0,
                customers: 0,
                earning: 0,
                paid: 0,
                claimProcessing: 0,
                claimStatus: 0,
            }
            Service.MerchantService.getMerchantExtended(criteria, projection, {}, function (err, data) {
                if (err) cb(err);
                else {
                    merchantSummary = data;
                    cb();
                }
            });
        },

    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: merchantSummary })
    })
}

var merchantLocationByCoordinates = function (payloadData, callback) {
    var merchantSummary;
    async.series([
        function (cb) {
            var criteria = {
                location: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [payloadData.long, payloadData.lat],
                            $maxDistance: 2000
                        },
                    }
                }
            };
            var projection = {
                orders: 0,
                customers: 0,
                earning: 0,
                paid: 0,
                claimProcessing: 0,
                claimStatus: 0,
            }
            Service.MerchantService.getMerchantExtended(criteria, projection, {}, function (err, data) {
                if (err) cb(err);
                else {
                    merchantSummary = data;
                    cb();
                }
            });
        },

    ], function (err, result) {
        if (err) callback(err)
        else callback(null, { data: merchantSummary })
    })
}

module.exports = {
    merchantLogin: merchantLogin,
    createMerchant: createMerchant,
    getMerchant: getMerchant,
    blockUnblockMerchant: blockUnblockMerchant,
    changePassword: changePassword,
    logoutMerchant: logoutMerchant,
    getMerchantExtendedProfile: getMerchantExtendedProfile,
    getOrdersHistory: getOrdersHistory,
    getClaimStatus: getClaimStatus,
    updateMerchantProfile: updateMerchantProfile,
    createClaim: createClaim,
    confirmMerchantClaim: confirmMerchantClaim,
    merchantLocationByKeyword: merchantLocationByKeyword,
    merchantLocationByCoordinates: merchantLocationByCoordinates
};


