var UniversalFunctions = require("../../utils/universalFunctions");
var Controller = require("../../controllers");
var Joi = require("joi");
var Config = require("../../config");

// var createCompany = {
//     method: "POST",
//     path: "/api/admin/createCompany",
//     handler: function (request, h) {
//         var userData =
//             (request.auth &&
//                 request.auth.credentials &&
//                 request.auth.credentials.userData) ||
//             null;
//         var payloadData = request.payload;
//         return new Promise((resolve, reject) => {
//             Controller.CompanyBaseController.createCompany(
//                 userData,
//                 payloadData,
//                 function (err, data) {
//                     if (!err) {
//                         resolve(UniversalFunctions.sendSuccess(null, data));
//                     } else {
//                         reject(UniversalFunctions.sendError(err));
//                     }
//                 }
//             );
//         });
//     },
//     config: {
//         description: "create company",
//         tags: ["api", "admin"],
//         auth: "UserAuth",
//         validate: {
//             headers: UniversalFunctions.authorizationHeaderObj,
//             payload: {
//                 companyName: Joi.string().required(),
//                 companyLogo: Joi.string().required(),
//                 location: Joi.string().required(),
//                 businessPhoneNumber: Joi.string().regex(/^[0-9]{10}$/).trim().min(2).required(),
//                 contactEmail: Joi.string().required(),
//                 companyDescription: Joi.string().required(),
//                 values: Joi.array().required()
//             },
//             failAction: UniversalFunctions.failActionFunction
//         },
//         plugins: {
//             "hapi-swagger": {
//                 responseMessages:
//                     UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
//             }
//         }
//     }
// };


var updateCompany = {
    method: "PUT",
    path: "/api/admin/updateCompany",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.CompanyBaseController.updateCompany(
                userData,
                payloadData,
                function (err, data) {
                    if (!err) {
                        resolve(UniversalFunctions.sendSuccess(null, data));
                    } else {
                        reject(UniversalFunctions.sendError(err));
                    }
                }
            );
        });
    },
    config: {
        description: "update company",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                companyName: Joi.string().required(),
                companyLogo: Joi.string().required(),
                location: Joi.string().required(),
                businessPhoneNumber: Joi.string().regex(/^[0-9]{10}$/).trim().min(2).required(),
                contactEmail: Joi.string().required(),
                companyDescription: Joi.string().required(),
                values: Joi.array().required()
            },
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            "hapi-swagger": {
                responseMessages:
                    UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var getCompany = {
    method: "GET",
    path: "/api/admin/getCompany",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.CompanyBaseController.getCompany(
                userData,
                function (err, data) {
                    if (!err) {
                        resolve(UniversalFunctions.sendSuccess(null, data));
                    } else {
                        reject(UniversalFunctions.sendError(err));
                    }
                }
            );
        });
    },
    config: {
        description: "get company details",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction
        },
        plugins: {
            "hapi-swagger": {
                responseMessages:
                    UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

module.exports = [
    //createCompany,
    updateCompany,
    getCompany
]