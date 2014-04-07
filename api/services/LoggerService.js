/**
 * /api/services/LogService.js
 *
 * Logger service.
 */
"use strict";

/**
 * Generic logger service method to write all necessary data of users
 * sign in action.
 *
 * @param   {sails.model.user}  user    User data
 * @param   {Request}           request Current request
 */
exports.userSignIn = function(user, request) {
    // Create new login row
    UserLogin
        .create({
            userId: user.id,
            ip: request.connection.remoteAddress,
            agent: request.headers["user-agent"],
            stamp: new Date()
        })
        .exec(function(error, userLogin) {
        });
};
