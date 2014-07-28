'use strict';

/**
 * ResponseService.js
 *
 * Generic helper service for response handling.
 */

/**
 * Simple service method to send "proper" error message back to client. This service method
 * is used all over the application in cases where errors may occur.
 *
 * @param   {Error|String|{}}   error
 * @param   {Request}           request
 * @param   {Response}          response
 *
 * @returns {*}
 */
exports.makeError = function(error, request, response) {
    sails.log.error(__filename + ':' + __line + ' [Error triggered]');
    sails.log.error(error);

    if (request.wantsJSON || request.isSocket) {
        var errorMessage = new Error();

        errorMessage.message = error.message ? error.message : error;
        errorMessage.status = error.status ? error.status : 500;

        return response.json(errorMessage.status, errorMessage);
    } else {
        return response.send(error.status ? error.status : 500, error.message ? error.message : error);
    }
};
