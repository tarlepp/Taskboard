'use strict';

/**
 * Generic logger service which Taskboard backend uses. Currently this service contains
 * following methods:
 *
 *  userLogin(user, request)
 *
 */

/**
 * Service method to add user login information to database. Note that this is called
 * only from AuthController after successfully user login action.
 *
 * @param   {sails.model.user}  user        User object
 * @param   {Request}           request     Request object
 */
exports.userLogin = function(user, request) {
    sails.log.error(__filename + ':' + __line + ' [Service.Logger.userLogin() called]');

    // Parse detailed information from user-agent string
    var r = require('ua-parser').parse(request.headers['user-agent']);

    // Create new UserLogin row to database
    UserLogin
        .create({
            ip:             request.ip,
            host:           request.host,
            agent:          request.headers['user-agent'],
            browser:        (r.ua.toString() || 'Unknown'),
            browserVersion: (r.ua.toVersionString() || 'Unknown'),
            browserFamily:  (r.ua.family || 'Unknown'),
            os:             (r.os.toString() || 'Unknown'),
            osVersion:      (r.os.toVersionString() || 'Unknown'),
            osFamily:       (r.os.family || 'Unknown'),
            user:           user.id
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to write user login data to database]');
                sails.log.error(error);
            }
        });
};
