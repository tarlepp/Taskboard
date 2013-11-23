/**
 * /api/services/ErrorService.js
 *
 * Generic error service.
 */
"use strict";

/**
 * Method returns generic error response message. Note that output varies if request
 * has been made via ajax, socket, json or some other way.
 *
 * @param   {Number}                    status      HTTP status code
 * @param   {String|sails.error.socket} message     Actual error message
 * @param   {Request}                   request     Request object
 * @param   {Response}                  response    Response object
 *
 * @returns {*}
 */
exports.makeErrorResponse = function(status, message, request, response) {
    if (request.isAjax || request.isJson || request.isSocket) {
        var errorMessage = new Error();

        errorMessage.message = message;
        errorMessage.status = status;

        return response.json(status, errorMessage);
    } else {
        return response.send(status, message);
    }
};