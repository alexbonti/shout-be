var UniversalFunctions = require("../../utils/universalFunctions");
var Controller = require("../../controllers");
var Joi = require("joi");
var Config = require("../../config");

var createTeam = {
    method: "POST",
    path: "/api/admin/createTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.createTeam(
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
    options: {
        description: "create team",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamName: Joi.string().required(),
                location: Joi.string().required(),
                managerIds: Joi.array().required(),
                userIds: Joi.array().required(),
            }),
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

var getTeams = {
    method: "GET",
    path: "/api/admin/getTeams",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.getTeams(
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
    options: {
        description: "get teams",
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

var getIndividualTeam = {
    method: "POST",
    path: "/api/admin/getIndividualTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.getIndividualTeam(
                userData,
                request.payload,
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
    options: {
        description: "get IndividualTeam",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            failAction: UniversalFunctions.failActionFunction,
            payload: Joi.object({
                teamId: Joi.string().required(),
            })
        },
        plugins: {
            "hapi-swagger": {
                responseMessages:
                    UniversalFunctions.CONFIG.APP_CONSTANTS.swaggerDefaultResponseMessages
            }
        }
    }
};

var updateTeam = {
    method: "PUT",
    path: "/api/admin/updateTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.updateTeam(
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
    options: {
        description: "update team",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
                teamName: Joi.string().required(),
                location: Joi.string().required(),
            }),
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

var deleteTeam = {
    method: "DELETE",
    path: "/api/admin/deleteTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.deleteTeam(
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
    options: {
        description: "delete team",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
            }),
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

var addUsersToTeam = {
    method: "PUT",
    path: "/api/admin/addUsersToTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.addUsersToTeam(
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
    options: {
        description: "add Users To Team",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
                userIds: Joi.array().required(),
            }),
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

var addManagersToTeam = {
    method: "PUT",
    path: "/api/admin/addManagersToTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.addManagersToTeam(
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
    options: {
        description: "add managers To Team",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
                managerIds: Joi.array().required(),
            }),
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

var promoteUserToManager = {
    method: "PUT",
    path: "/api/admin/promoteUserToManager",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.promoteUserToManager(
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
    options: {
        description: "promote User To Manager",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
                userId: Joi.string().required(),
            }),
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


var demoteManagerToUser = {
    method: "PUT",
    path: "/api/admin/demoteManagerToUser",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.demoteManagerToUser(
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
    options: {
        description: "demote Manager To User",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
                managerId: Joi.string().required(),
            }),
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

var removeMemberFromTeam = {
    method: "PUT",
    path: "/api/admin/removeMemberFromTeam",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.payload;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.removeMemberFromTeam(
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
    options: {
        description: "remove Member From team",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            payload: Joi.object({
                teamId: Joi.string().required(),
                memberId: Joi.array().required(),
            }),
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

var getSpecificUserHistory = {
    method: "GET",
    path: "/api/admin/getSpecificUserHistory/{userId}",
    handler: function (request, h) {
        var userData =
            (request.auth &&
                request.auth.credentials &&
                request.auth.credentials.userData) ||
            null;
        var payloadData = request.params;
        return new Promise((resolve, reject) => {
            Controller.TeamBaseController.getSpecificUserHistory(
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
    options: {
        description: "Get specific user History",
        tags: ["api", "admin"],
        auth: "UserAuth",
        validate: {
            headers: UniversalFunctions.authorizationHeaderObj,
            params: {
                userId: Joi.string().required(),
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
    createTeam,
    getTeams,
    updateTeam,
    addUsersToTeam,
    addManagersToTeam,
    promoteUserToManager,
    demoteManagerToUser,
    removeMemberFromTeam,
    deleteTeam,
    getIndividualTeam,
    getSpecificUserHistory
]