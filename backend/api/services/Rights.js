'use strict';

/**
 * /api/services/Rights.js
 *
 * Generic rights service which contains functions to restrict users access only
 * to specified objects on each model.
 */

var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Service function which adds necessary object specified conditions to Project
 * model queries. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Mutilate current where condition:
 *      - if 'id' property exists in query remove not valid projects
 *      - if not add 'id' property to query with valid projects
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightProject = function(request, response, next) {
    sails.log.verbose(' RIGHT - ' + __filename + ':' + __line);

    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token}, function(error, validIds) {
            return sails.services['rights']
                .makeObjectCondition(error, validIds, 'id', request, response, next);
        });
};

/**
 * Service function which adds necessary object specified conditions to Sprint
 * model queries. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Mutilate current where condition:
 *      - if 'project' property exists in query remove not valid projects
 *      - if not add 'project' property to query with valid projects
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightSprint = function(request, response, next) {
    sails.log.verbose(' RIGHT - ' + __filename + ':' + __line);

    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token}, function(error, validIds) {
            return sails.services['rights']
                .makeObjectCondition(error, validIds, 'project', request, response, next);
        });
};

/**
 * Below is helper service methods that are just used inside of this service.
 */

/**
 * Generic function which will make necessary object (Project, Sprint, etc.) specified conditions
 * to blueprints query.
 *
 * @param   {null|Error}    error       Possible error object
 * @param   {null|[]}       validIds    Valid id values that are attached to query
 * @param   {String}        property    Model property name where to attach id values
 * @param   {Request}       request     Request object
 * @param   {Response}      response    Response object
 * @param   {Function}      next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectCondition = function(error, validIds, property, request, response, next) {
    if (error) {
        return response.negotiate(error);
    }

    // Make where condition against specified model property with determined id values
    var where = sails.services['rights']
        .makeConditionValidProperty(validIds, property, request);

    // There is no "valid" property values so we need to send 404 back to client
    if (_.isEmpty(where[property])) {
        error = {
            status: 404
        };

        return response.negotiate(error);
    }

    // Remove existing query
    delete request.query;

    // Set new query to request, that blueprints will use after this
    request.query = {
        where: where
    };

    return next();
};

/**
 * Helper function which will mutilate current where condition. Function will add specified
 * property condition with given values to current where object.
 *
 * @param   {[]}        validIds    Valid id values that are attached to current where condition
 * @param   {String}    property    Name of the where condition where to attach id values
 * @param   {Request}   request     Request object
 *
 * @returns {{}}                    Where object
 */
exports.makeConditionValidProperty = function(validIds, property, request) {
    // Parse where criteria
    var where = actionUtil.parseCriteria(request);

    // Normalize valid id array
    validIds = _.map(validIds, function(id) {
        return parseInt(id, 10);
    });

    // Specified property is not yet in where query
    if (!where[property]) {
        where[property] = validIds;
    } else { // We have id condition set so we need to check if that / those are allowed
        // Normalize current ids
        var currentIds = _.map((!_.isArray(where[property])) ? [where[property]] : where[property], function (id) {
            return parseInt(id, 10);
        });

        // Remove not valid ids
        where[property] = _.intersection(currentIds, validIds);
    }

    return where;
};
