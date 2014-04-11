/**
 * /api/services/ResponseService.js
 *
 * Generic response helper service.
 */
"use strict";

/**
 * Simple service method to send "proper" error message back to client. This is called basically
 * all over the application in cases where error may occur.
 *
 * @param   {Error|{}}  error       Error object
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 *
 * @returns {*}
 */
exports.makeError = function(error, request, response) {
    sails.log.error(__filename + ":" + __line + " [Error triggered]");
    sails.log.error(error);

    if (request.isAjax || request.isJson || request.isSocket) {
        var errorMessage = new Error();

        errorMessage.message = error.message ? error.message : error;
        errorMessage.status = error.status ? error.status : 500;

        return response.json(errorMessage.status, errorMessage);
    } else {
        return response.send(error.status ? error.status : 500, error.message ? error.message : error);
    }
};
