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
                values: Joi.array().items(
                    {
                        name: Joi.string().required(),
                        description: Joi.string().required()
                    }
                ).required(),
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


var addValuesToCompany = {
    method: "PUT",
    path: "/api/admin/addValuesToCompany",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.CompanyBaseController.addValuesToCompany(
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
        description: "add Values To Company",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                values: Joi.array().items(
                    {
                        name: Joi.string().required(),
                        description: Joi.string().required()
                    }
                ).required(),
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

var editValuesOfCompany = {
    method: "PUT",
    path: "/api/admin/editValuesOfCompany",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.CompanyBaseController.editValuesOfCompany(
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
        description: "edit Values of Company",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                valuesId: Joi.string().required(),
                name: Joi.string().required(),
                description: Joi.string().required()
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

var removeValueFromCompany = {
    method: "DELETE",
    path: "/api/admin/removeValueFromCompany",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.CompanyBaseController.removeValueFromCompany(
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
        description: "remove Value From Company",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                valuesId: Joi.string().required(),
                // name: Joi.string().required(),
                // description: Joi.string().required()
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

var updateCompanyVision = {
    method: "PUT",
    path: "/api/admin/updateCompanyVision",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.CompanyBaseController.updateCompanyVision(
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
        description: "update company vision",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                companyDescription: Joi.string().required(),
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
module.exports = [
    //createCompany,
    updateCompany,
    getCompany,
    addValuesToCompany,
    editValuesOfCompany,
    removeValueFromCompany,
    updateCompanyVision
]