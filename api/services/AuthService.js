/**
 * /api/services/AuthService.js
 *
 * Generic auth service, which is used to check if user has access to asked object or which role
 * he / she is attached to that object.
 *
 * Basically all service methods uses finally either 'hasProjectAccess' or 'hasProjectAdmin' methods
 * to determine actual access to asked object.
 */
"use strict";

var randomstring = require("randomstring");

// Remember me tokens, that are valid for single server instance
var tokens = {};

/**
 * Service method to consume single user remember me token.
 *
 * @param   {String}    token   Token to consume
 * @param   {Function}  next    Callback function to return
 *
 * @returns {*}
 */
exports.consumeRememberMeToken = function(token, next) {
    var uid = tokens[token];

    // invalidate the single-use token
    delete tokens[token];

    return next(null, uid);
};

/**
 * Service method to save given user id to specified token.
 *
 * @param   {String}    token   Token to be save
 * @param   {Number}    uid     User id which is assigned to given token
 * @param   {Function}  next    Callback function
 *
 * @returns {*}
 */
exports.saveRememberMeToken = function(token, uid, next) {
    tokens[token] = uid;

    return next();
};

/**
 * Service method to issue new remember me token for specified user.
 *
 * @param   {sails.model.user}  user    User object
 * @param   {Function}          next    Callback function
 */
exports.issueToken = function(user, next) {
    var token = randomstring.generate(64);

    AuthService.saveRememberMeToken(token, user.id, function(error) {
        if (error) {
            return next(error);
        }

        return next(null, token);
    });
};