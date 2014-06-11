'use strict';

var jwt = require('jsonwebtoken');

/**
 * Service method to generate a new token based on payload we want to put on it.
 *
 * @param   {String}    payload
 *
 * @returns {*}
 */
module.exports.issueToken = function(payload) {
    return jwt.sign(
        payload, // This is the payload we want to put inside the token
        process.env.TOKEN_SECRET || "oursecret" // Secret string which will be used to sign the token
    );
};

/**
 * Service method to verify that the token we received on a request hasn't be tampered with.
 *
 * @param   {String}    token   Token to validate
 * @param   {Function}  next    Callback function
 *
 * @returns {*}
 */
module.exports.verifyToken = function(token, next) {
    return jwt.verify(
        token, // The token to be verified
        process.env.TOKEN_SECRET || "oursecret", // The secret we used to sign it.
        {}, // Options, none in this case
        next // The callback to be call when the verification is done.
    );
};