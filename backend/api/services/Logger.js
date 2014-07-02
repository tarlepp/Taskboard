'use strict';

/**
 * Generic logger service which Taskboard backend uses. Currently this service contains
 * following methods:
 *
 *  userLogin(user, request)
 */

/**
 * Service method to add user login information to database.
 *
 * @param   {sails.model.user}  user        User object
 * @param   {Request}           request     Request object
 */
exports.userLogin = function(user, request) {
    sails.log.error(__filename + ':' + __line + ' [Service.Logger.userLogin() called]');

    // Create new UserLogin row to database
    UserLogin
        .create({
            ip:     request.ip,
            host:   request.host,
            agent:  request.headers['user-agent'],
            user:   user.id
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to write user login data to database]');
                sails.log.error(error);
            }
        });
};
