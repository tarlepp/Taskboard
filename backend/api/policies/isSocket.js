'use strict';

/**
 * Policy to check that request is really made via Socket.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function(request, response, next) {
    sails.log.verbose(' POLICY - ' + __filename);

    // Yeah, we have socket request
    if (request.isSocket) {
        sails.log.verbose('     OK');

        next();
    } else {
        sails.log.verbose('     ERROR - Request was not made via Socket');

        var error = new Error();

        error.message = 'Only socket request allowed.';
        error.status = 403;

        next(error);
    }
};
