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
                    $addToSet : {
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


var getCompany = function (userData, callback) {
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
                            cb();
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
    updateCompany : updateCompany,
    getCompany : getCompany
}