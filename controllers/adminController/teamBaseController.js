var Service = require("../../services");
var UniversalFunctions = require("../../utils/universalFunctions");
var async = require("async");
// var UploadManager = require('../../lib/uploadManager');
var TokenManager = require("../../lib/tokenManager");
var CodeGenerator = require("../../lib/codeGenerator");
var ERROR = UniversalFunctions.CONFIG.APP_CONSTANTS.STATUS_MSG.ERROR;
var _ = require("underscore");

var createTeam = function (userData, payloadData, callback) {
    var teamDetails;
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
                        adminSummary = data && data[0] || null;
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
                payloadData.adminId = userData._id;
                payloadData.companyId = adminSummary.companyId;
                Service.TeamService.createTeam(payloadData, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};

var getTeams = function (userData, callback) {
    var teamDetails;
    var adminSummary = [];
    var teams = [];
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
                var path = "managerIds userIds";
                var select = "firstName lastName";
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

                Service.TeamService.getPopulatedUserDetails({
                    adminId: userFound._id,
                    isActive: true
                }, projection, populate, {}, {}, function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        teamDetails = data;
                        cb();
                    }
                });
            },

            function (cb) {
                if (teamDetails) {
                    var taskInParallel = [];
                    for (var key in teamDetails) {
                        (function (key) {
                            taskInParallel.push((function (key) {
                                return function (embeddedCB) {
                                    var total = teamDetails[key].managerIds.length + teamDetails[key].userIds.length
                                    teams.push({ team: teamDetails[key], totalMembers: total });
                                    console.log(">>>>>>>>>>>>>", total)
                                    embeddedCB()
                                }
                            })(key))
                        }(key));
                    }
                    async.parallel(taskInParallel, function (err, result) {
                        cb(null);
                    });
                }
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teams });
        }
    );
};


var getIndividualTeam = function (userData, payloadData, callback) {
    var teamDetails;
    var adminSummary = [];
    var teams = [];
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
                var path = "managerIds userIds";
                var select = "firstName lastName";
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

                Service.TeamService.getPopulatedUserDetails({
                    adminId: userFound._id,
                    isActive: true,
                    _id: payloadData.teamId
                }, projection, populate, {}, {}, function (err, data) {
                    if (err) {
                        cb(err);
                    } else {
                        teamDetails = data;
                        cb();
                    }
                });
            },

            function (cb) {
                if (teamDetails) {
                    var taskInParallel = [];
                    for (var key in teamDetails) {
                        (function (key) {
                            taskInParallel.push((function (key) {
                                return function (embeddedCB) {
                                    var total = teamDetails[key].managerIds.length + teamDetails[key].userIds.length
                                    teams.push({ team: teamDetails[key], totalMembers: total });
                                    console.log(">>>>>>>>>>>>>", total)
                                    embeddedCB()
                                }
                            })(key))
                        }(key));
                    }
                    async.parallel(taskInParallel, function (err, result) {
                        cb(null);
                    });
                }
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teams });
        }
    );
};

var updateTeam = function (userData, payloadData, callback) {
    var teamDetails;
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
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },

            function (cb) {
                dataToUpdate = {
                    $set: {
                        teamName: payloadData.teamName,
                        location: payloadData.location
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};

var deleteTeam = function (userData, payloadData, callback) {
    var teamDetails;
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
                            cb();
                        }
                    }
                });
            },

            function (cb) {
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId, isActive: true }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },

            function (cb) {
                dataToUpdate = {
                    $set: {
                        isActive: false
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};

var addUsersToTeam = function (userData, payloadData, callback) {
    var teamDetails;
    var adminSummary = [];
    var managers = [];
    var users = [];
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
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },
            function (cb) {
                teamDetails.managerIds.forEach(element => {
                    managers.push(String(element));
                });
                cb()
            },

            function (cb) {
                for (var x in payloadData.userIds) {
                    if (managers.indexOf(String(payloadData.userIds[x])) == -1) {
                        users.push(payloadData.userIds[x]);
                    }

                    if (x == payloadData.userIds.length - 1) {
                        cb();
                    }
                }
            },

            function (cb) {
                dataToUpdate = {
                    $addToSet: {
                        userIds: users
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};


var addManagersToTeam = function (userData, payloadData, callback) {
    var teamDetails;
    var adminSummary = [];
    var managers = [];
    var users = [];
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
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },

            function (cb) {
                teamDetails.managerIds.forEach(element => {
                    users.push(String(element));
                });
                cb()
            },

            function (cb) {
                for (var x in payloadData.managerIds) {
                    if (users.indexOf(String(payloadData.managerIds[x])) == -1) {
                        managers.push(payloadData.managerIds[x])
                    }

                    if (x == payloadData.managerIds.length - 1) {
                        cb();
                    }
                }
            },

            function (cb) {
                dataToUpdate = {
                    $addToSet: {
                        managerIds: managers
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};

var promoteUserToManager = function (userData, payloadData, callback) {
    var teamDetails;
    var adminSummary = [];
    var users = [];
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
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },

            function (cb) {
                teamDetails.userIds.forEach(element => {
                    users.push(String(element));
                });
                cb()
            },

            function (cb) {
                if (users.indexOf(String(payloadData.userId)) == -1) {
                    cb(ERROR.INVALID_TEAM_MEMBER)
                }
                else {
                    cb()
                }
            },

            function (cb) {
                dataToUpdate = {
                    $addToSet: {
                        managerIds: payloadData.userId
                    },
                    $pull: {
                        userIds: payloadData.userId
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};

var demoteManagerToUser = function (userData, payloadData, callback) {
    var teamDetails;
    var adminSummary = [];
    var managers = [];
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
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },

            function (cb) {

                teamDetails.managerIds.forEach(element => {
                    managers.push(String(element));
                });
                cb()
            },

            function (cb) {
                if (managers.indexOf(String(payloadData.managerId)) == -1) {
                    cb(ERROR.INVALID_TEAM_MEMBER)
                }
                else {
                    cb()
                }
            },

            function (cb) {
                dataToUpdate = {
                    $addToSet: {
                        userIds: payloadData.managerId
                    },
                    $pull: {
                        managerIds: payloadData.managerId
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};

var removeMemberFromTeam = function (userData, payloadData, callback) {
    var teamDetails;
    var adminSummary = [];
    var users = [];
    var managers = [];
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
                Service.TeamService.getTeam({ adminId: userFound._id, _id: payloadData.teamId }, { _v: 0 }, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        if (data.length == 0) cb(ERROR.INVALID_TEAM_ID)
                        else {
                            teamDetails = data && data[0] || null;
                            cb();
                        }
                    }
                })
            },

            function (cb) {
                dataToUpdate = {
                    $pull: {
                        managerIds: payloadData.memberId,
                        userIds: payloadData.memberId
                    }
                }
                Service.TeamService.updateTeam({ _id: teamDetails._id }, dataToUpdate, {}, function (err, data) {
                    if (err) cb(err)
                    else {
                        teamDetails = data[0];
                        cb();
                    }
                })
            }

        ],
        function (err, result) {
            if (err) return callback(err);
            else return callback(null, { data: teamDetails });
        }
    );
};


module.exports = {
    createTeam: createTeam,
    getTeams: getTeams,
    updateTeam: updateTeam,
    addUsersToTeam: addUsersToTeam,
    addManagersToTeam: addManagersToTeam,
    promoteUserToManager: promoteUserToManager,
    demoteManagerToUser: demoteManagerToUser,
    removeMemberFromTeam: removeMemberFromTeam,
    deleteTeam: deleteTeam,
    getIndividualTeam: getIndividualTeam
}