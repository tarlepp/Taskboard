'use strict';

var _ = require('lodash');

/**
 * Policy to set necessary update data to body. Note that this policy will
 * also remove some body items.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function(request, response, next) {
    sails.log.verbose(' POLICY - ' + __filename + ':' + __line);

    if (request.token) {
        var itemsToRemove = [
            'id',
            'createdUser',
            'updatedUser',
            'createdAt',
            'updatedAt'
        ];

        _.each(itemsToRemove, function(item) {
            delete request.body[item];
        });

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
