var UniversalFunctions = require("../../utils/universalFunctions");
var Controller = require("../../controllers");
var Joi = require("joi");
var Config = require("../../config");

var MerchantLogin = {
    method: "POST",
    path: "/api/merchant/login",
    config: {
        description: "Merchant Login",
        tags: ["api", "merchant"],
        handler: function (request, h) {
            return new Promise((resolve, reject) => {
                Controller.MerchantBaseController.merchantLogin(request.payload, function (
                    error,
                    data
                ) {
                    if (error) {
                        reject(UniversalFunctions.sendError(error));
                    } else {
                        resolve(UniversalFunctions.sendSuccess(null, data));
                    }
                });
            });
        },
        validate: {
            payload: {
                emailId: Joi.string().required(),
                password: Joi.string()
                    .required()
                    .min(5)
                    .trim()
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

var createMerchant = {
    method: "POST",
    path: "/api/merchant/createMerchant",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.createMerchant(
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
        description: "create Merchant",
        tags: ["api", "merchant"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                emailId: Joi.string().required(),
                fullName: Joi.string()
                    .optional()
                    .allow("")
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

var getMerchant = {
    method: "GET",
    path: "/api/merchant/getMerchant",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.getMerchant(userData, function (err, data) {
                if (!err) {
                    resolve(UniversalFunctions.sendSuccess(null, data));
                } else {
                    reject(UniversalFunctions.sendError(err));
                }
            });
        });
    },
    config: {
        description: "get Merchants list",
        tags: ["api", "Merchant"],
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

var blockUnblockMerchant = {
    method: "PUT",
    path: "/api/merchant/blockUnblockMerchant",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.blockUnblockMerchant(
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
        description: "block/unblock a Merchant",
        tags: ["api", "merchant"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                MerchantId: Joi.string().required(),
                block: Joi.boolean().required()
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

var changePassword = {
    method: "PUT",
    path: "/api/merchant/changePassword",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.changePassword(
                userData,
                request.payload,
                function (err, user) {
                    if (!err) {
                        resolve(
                            UniversalFunctions.sendSuccess(
                                UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS
                                    .PASSWORD_RESET,
                                user
                            )
                        );
                    } else {
                        reject(UniversalFunctions.sendError(err));
                    }
                }
            );
        });
    },
    config: {
        description: "change Password",
        tags: ["api", "merchant"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                skip: Joi.boolean().required(),
                oldPassword: Joi.string().when('skip', { is: false, then: Joi.string().required().min(5), otherwise: Joi.string().optional().allow("") }),
                newPassword: Joi.string().when('skip', { is: false, then: Joi.string().required().min(5), otherwise: Joi.string().optional().allow("") })
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

var logoutMerchant = {
    method: "PUT",
    path: "/api/merchant/logout",
    config: {
        description: "Logout Merchant",
        auth: "UserAuth",
        tags: ["api", "merchant"],
        handler: function (request, h) {
            var userData =
                (request.auth &&
                    request.auth.credentials &&
                    request.auth.credentials.userData) ||
                null;
            return new Promise((resolve, reject) => {
                Controller.MerchantBaseController.logoutMerchant(userData, function (
                    err,
                    data
                ) {
                    if (err) {
                        reject(UniversalFunctions.sendError(err));
                    } else {
                        resolve(
                            UniversalFunctions.sendSuccess(
                                UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS
                                    .LOGOUT
                            )
                        );
                    }
                });
            });
        },
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

var getMerchantSummary = {
    method: "GET",
    path: "/api/merchant/getMerchantSummary",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.getMerchantExtendedProfile(userData, function (err, data) {
                if (!err) {
                    resolve(UniversalFunctions.sendSuccess(null, data));
                } else {
                    reject(UniversalFunctions.sendError(err));
                }
            });
        });
    },
    config: {
        description: "get shouting Summary for Merchant",
        tags: ["api", "merchant"],
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

var getOrdersHistory = {
    method: "GET",
    path: "/api/merchant/getOrdersHistory",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.getOrdersHistory(userData, function (err, data) {
                if (!err) {
                    resolve(UniversalFunctions.sendSuccess(null, data));
                } else {
                    reject(UniversalFunctions.sendError(err));
                }
            });
        });
    },
    config: {
        description: "get Merchant Orders History",
        tags: ["api", "Merchant"],
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

var getClaimStatus = {
    method: "GET",
    path: "/api/merchant/getClaimStatus",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.TopUpBaseController.getClaimStatus(userData, function (err, data) {
                if (!err) {
                    resolve(UniversalFunctions.sendSuccess(null, data));
                } else {
                    reject(UniversalFunctions.sendError(err));
                }
            });
        });
    },
    config: {
        description: "Get Claim Status",
        tags: ["api", "merchant"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction,
        },
        plugins: {
            "hapi-swagger": {
                responseMessages:
                    UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var updateMerchantProfile = {
    method: "PUT",
    path: "/api/merchant/updateMerchantProfile",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        return new Promise((resolve, reject) => {
            Controller.MerchantBaseController.updateMerchantProfile(
                userData,
                request.payload,
                function (err, user) {
                    if (!err) {
                        resolve(
                            UniversalFunctions.sendSuccess(
                                UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.SUCCESS.DEFAULT,
                                user
                            )
                        );
                    } else {
                        reject(UniversalFunctions.sendError(err));
                    }
                }
            );
        });
    },
    config: {
        description: "update Merchant Profile",
        tags: ["api", "merchant"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: {
                storeName: Joi.string().required(),
                storeNumber: Joi.string().regex(/^[0-9]+$/).min(5).optional(),
                profilePicture: Joi.string().required(),
                lat: Joi.string().required(),
                long: Joi.string().required()
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
var merchantBaseRoute = [
    MerchantLogin,
    createMerchant,
    getMerchant,
    blockUnblockMerchant,
    changePassword,
    logoutMerchant,
    getMerchantSummary,
    getOrdersHistory,
    getClaimStatus,
    updateMerchantProfile
];
module.exports = merchantBaseRoute;

