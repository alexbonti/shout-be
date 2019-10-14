var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");
var Config = require("../../config");

// var createCompany = function (userData, payloadData, callback) {
//     var companyDetails;
//     async.series(
//         [
//             function (cb) {
//                 var criteria = {
//                     _id: userData._id
//                 };
//                 Service.AdminService.getAdmin(criteria, { password: 0 }, {}, function (err, data) {
//                     if (err) cb(err);
//                     else {
//                         if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
//                         else {
//                             userFound = (data && data[0]) || null;
//                             if (userFound.userType != Config.APP_CONSTANTS.DATABASE.USER_ROLES.SUPERADMIN) cb(ERROR.PRIVILEGE_MISMATCH);
//                             else cb();
//                         }
//                     }
//                 });
//             },
//             function (cb) {
//                 Service.CompanyService.getCompany({ superAdminId: userFound._id }, {}, {}, function (err, data) {
//                     if (err) cb(err)
//                     else {
//                         if (data.length == 0) cb()
//                         else cb(ERROR.DEFAULT)
//                     }
//                 })
//             },

//             function (cb) {
//                 payloadData.superAdminId = userFound._id;
//                 Service.CompanyService.createCompany(payloadData, function (err, data) {
//                     if (err) cb(err)
//                     else {
//                         companyDetails = data
//                         console.log(data[0])
//                         cb();
//                     }
//                 })
//             }
//         ],
//         function (err, result) {
//             if (err) return callback(err);
//             else return callback(null, { companyDetails });
//         }
//     );
// };

/* Three layer model
var updateCompany = function (userData, payloadData, callback) {
    var companyDetails;
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
                Service.CompanyService.getCompany({ superAdminId: userFound._id }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $set:
                    {
                        companyName: payloadData.companyName,
                        companyLogo: payloadData.companyLogo,
                        location: payloadData.location,
                        businessPhoneNumber: payloadData.businessPhoneNumber,
                        contactEmail: payloadData.contactEmail,
                        companyDescription: payloadData.companyDescription,
                    },
                    $addToSet: {
                        values: payloadData.values
                    }
                };
                var condition = {
                    superAdminId: userFound._id,
                    _id: companyDetails._id
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        console.log(data[0])
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};


var addValuesToCompany = function (userData, payloadData, callback) {
    var companyDetails;
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
                Service.CompanyService.getCompany({ superAdminId: userFound._id }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $addToSet: {
                        values: payloadData.values
                    }
                };
                var condition = {
                    superAdminId: userFound._id,
                    _id: companyDetails._id
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};


var editValuesOfCompany = function (userData, payloadData, callback) {
    var companyDetails;
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
                Service.CompanyService.getCompany({ superAdminId: userFound._id }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $set: {
                        "values.$.name": payloadData.name,
                        "values.$.description": payloadData.description
                    }
                };
                var condition = {
                    superAdminId: userFound._id,
                    _id: companyDetails._id,
                    values: {
                        $elemMatch: {
                            _id: payloadData.valuesId
                        }
                    }
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};

var removeValueFromCompany = function (userData, payloadData, callback) {
    var companyDetails;
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
                Service.CompanyService.getCompany({ superAdminId: userFound._id }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $pull: {
                        values: {
                            _id: payloadData.valuesId
                        }
                    }
                };
                var condition = {
                    superAdminId: userFound._id,
                    _id: companyDetails._id,
                    values: {
                        $elemMatch: {
                            _id: payloadData.valuesId
                        }
                    }
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};
*/

/////////////////////////////////////////////////////////////////////////////
var updateCompany = function (userData, payloadData, callback) {
    var companyDetails;
    var companyId;
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
                };
                Service.AdminService.getAdminExtended(criteria, { password: 0 }, {}, function (err, data) {
                    if (err) cb(err);
                    else {
                        if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
                        else {
                            companyId = (data && data[0].companyId) || null;
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.CompanyService.getCompany({ _id: companyId }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $set:
                    {
                        companyName: payloadData.companyName,
                        companyLogo: payloadData.companyLogo,
                        location: payloadData.location,
                        businessPhoneNumber: payloadData.businessPhoneNumber,
                        contactEmail: payloadData.contactEmail,
                        companyDescription: payloadData.companyDescription,
                    },
                    $addToSet: {
                        values: payloadData.values
                    }
                };
                var condition = {
                    _id: companyDetails._id
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        console.log(data[0])
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};
/////////////////////////////////////////////////////////////////////////////////////
var addValuesToCompany = function (userData, payloadData, callback) {
    var companyDetails;
    var companyId;
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
                };
                Service.AdminService.getAdminExtended(criteria, { password: 0 }, {}, function (err, data) {
                    if (err) cb(err);
                    else {
                        if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
                        else {
                            companyId = (data && data[0].companyId) || null;
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.CompanyService.getCompany({ _id: companyId }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $addToSet: {
                        values: payloadData.values
                    }
                };
                var condition = {
                    _id: companyDetails._id
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};

var editValuesOfCompany = function (userData, payloadData, callback) {
    var companyDetails;
    var companyId;
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
                };
                Service.AdminService.getAdminExtended(criteria, { password: 0 }, {}, function (err, data) {
                    if (err) cb(err);
                    else {
                        if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
                        else {
                            companyId = (data && data[0].companyId) || null;
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.CompanyService.getCompany({ _id: companyId }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $set: {
                        "values.$.name": payloadData.name,
                        "values.$.description": payloadData.description
                    }
                };
                var condition = {
                    _id: companyDetails._id,
                    values: {
                        $elemMatch: {
                            _id: payloadData.valuesId
                        }
                    }
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};


var removeValueFromCompany = function (userData, payloadData, callback) {
    var companyDetails;
    var companyId;
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
                };
                Service.AdminService.getAdminExtended(criteria, { password: 0 }, {}, function (err, data) {
                    if (err) cb(err);
                    else {
                        if (data.length == 0) cb(ERROR.INCORRECT_ACCESSTOKEN);
                        else {
                            companyId = (data && data[0].companyId) || null;
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.CompanyService.getCompany({ _id: companyId }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            },

            function (cb) {

                var dataToUpdate = {
                    $pull: {
                        values: {
                            _id: payloadData.valuesId
                        }
                    }
                };
                var condition = {
                    _id: companyDetails._id,
                    values: {
                        $elemMatch: {
                            _id: payloadData.valuesId
                        }
                    }
                };
                Service.CompanyService.updateCompany(condition, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        companyDetails = data
                        cb();
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};
/////////////////////////////////////////////////////////////////////////////////////

var getCompany = function (userData, callback) {
    var companyDetails;
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
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.AdminService.getAdminExtended({ adminId: userFound._id }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        userDetails = data && data[0] || null;
                        cb();
                    }
                })
            },

            function (cb) {
                Service.CompanyService.getCompany({ _id: userDetails.companyId }, {}, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_COMPANY_ID)
                        else {
                            companyDetails = data && data[0] || null
                            cb()
                        }
                    }
                })
            }
        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { companyDetails });
        }
    );
};
module.exports = {
    // createCompany: createCompany,
    updateCompany: updateCompany,
    getCompany: getCompany,
    addValuesToCompany: addValuesToCompany,
    editValuesOfCompany: editValuesOfCompany,
    removeValueFromCompany: removeValueFromCompany
}