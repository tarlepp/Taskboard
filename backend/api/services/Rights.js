'use strict';

/**
 * /api/services/Rights.js
 *
 * This file contains generic right check methods that other services will use.
 */

var _ = require('lodash');

/**
 * Generic right property checker method. This is called from following services:
 *  - RightsAdd
 *  - RightsMod
 *
 * @param   {null|Error}    error       Possible error object
 * @param   {null|[]}       validIds    Valid id values that are attached to current user
 * @param   {String}        property    Property name which is checked
 * @param   {String}        type        Right type, this can be 'get', 'add', 'mod' or 'del'
 * @param   {Request}       request     Request object
 * @param   {Response}      response    Response object
 * @param   {Function}      next        Callback function
 *
 * @returns {*}
 */
exports.checkRightProperty = function(error, validIds, property, type, request, response, next) {
    if (error) {
        sails.log.err('Error occurred while processing model ' + type + ' rights.');
        sails.log.err(error);

        return response.negotiate(error);
    }

    // Get parameter from request.
    var param = parseInt(request.param(property), 10);

    // Determine name of the current model
    var model = request.options.model || request.options.controller;

    // Parameter not found or it's not a number
    if (!param || isNaN(param)) {
        sails.log.warn('User did not provide required parameter \'' + property + '\' to ' + type + ' new \'' + model + '\' object.');

        error = new Error();

        error.status = 400;
        error.message = 'Required parameter \'' + property + '\' is missing.';

        return response.negotiate(error);
    } else if (_.isNull(validIds) || !_.isArray(validIds) || validIds.length === 0) { // No valid ids founded
        sails.log.warn('User tried to ' + type + ' \'' + model + '\' object and he / she do not have any valid objects');

        error = new Error();

        error.status = 400;
        error.message = 'You do not have access to ' + type + ' this object.';

        return response.negotiate(error);
    } else if (_.indexOf(validIds, param) === -1) { // Given parameter not allowed to current user
        sails.log.warn('User tried to ' + type + ' \'' + model + '\' object with data he / she do not have access.');

        error = new Error();

        error.status = 400;
        error.message = 'You do not have access to ' + type + ' this object.';

        return response.negotiate(error);
    }

    return next();
};