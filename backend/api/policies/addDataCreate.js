'use strict';

/**
 * Policy to set necessary create data to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function(request, response, next) {
    sails.log.verbose(' POLICY - ' + __filename + ':' + __line);

    if (request.token) {
        request.body.createdUser = request.token;
        request.body.updatedUser = request.token;

        sails.log.verbose('     OK');

        next();
    } else {
        sails.log.verbose('     ERROR - request token not found');

        var error = new Error();

        error.message = 'Request token not present.';
        error.status = 403;

        next(error);
    }
};
