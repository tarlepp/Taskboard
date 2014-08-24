'use strict';

/**
 * /api/services/Rights.js
 *
 * Generic rights service which contains functions to restrict users access only
 * to specified objects on each model. Note that these functions will restrict
 * default blueprint GET queries.
 */

var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Service function which adds necessary object specified conditions to Epic
 * model queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightComment = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericDynamic(request, response, next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Epic model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightEpic = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * ExcludeSprintDay model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightExcludesprintday = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericSprint(request, response, 'sprint', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * ExternalLink model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightExternallink = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * File model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightFile = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericDynamic(request, response, next);
};

/**
 * Service function which adds necessary object specified conditions for
 * History model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightHistory = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericDynamic(request, response, next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Language model queries. This model doesn't contain any sensitive data
 * so there is not a row specified right checks.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightLanguage = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return next();
};

/**
 * Service function which adds necessary object specified conditions for
 * Link model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightLink = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericDynamic(request, response, next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Milestone model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightMilestone = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Phase model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightPhase = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Project model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightProject = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'id', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * ProjectUser model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightProjectuser = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'id', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Sprint model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightSprint = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Story model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightStory = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * Task model queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightTask = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericStory(request, response, 'story', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * TaskType model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightTasktype = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericProject(request, response, 'project', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * User model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightUser = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericUser(request, response, 'id', next);
};

/**
 * Service function which adds necessary object specified conditions for
 * UserLogin model blueprint queries.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightUserlogin = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rights']
        .makeObjectRightGenericUser(request, response, 'user', next);
};

/**
 * Below is helper service methods that are just used inside of this service.
 */

/**
 * Generic object right helper function which will mutilate current where object
 * that way it contains necessary right checks. This is used to attach necessary
 * project limitation to query. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Mutilate current where condition:
 *      - if 'project' property exists in query remove not valid projects
 *      - if not add 'project' property to query with valid projects
 *
 * This helper function is called from following 'makeObjectRight*' functions,
 * because all of those models contains directly project id attribute.
 *  - makeObjectRightEpic
 *  - makeObjectRightExternallink
 *  - makeObjectRightMilestone
 *  - makeObjectRightPhase
 *  - makeObjectRightProject
 *  - makeObjectRightProjectuser
 *  - makeObjectRightSprint
 *  - makeObjectRightStory
 *  - makeObjectRightTasktype
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightGenericProject = function(request, response, property, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: 1}, function(error, projectIds) {
            return sails.services['rights']
                .makeObjectCondition(error, projectIds, property, request, response, next);
        });
};

/**
 * Generic object right helper function which will mutilate current where object
 * that way it contains necessary right checks. This is used to attach necessary
 * sprint limitation to query. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch sprint ids for those projects
 *  2) Mutilate current where condition:
 *      - if 'sprint' property exists in query remove not valid sprints
 *      - if not add 'sprint' property to query with valid sprints
 *
 * This helper function is called from following 'makeObjectRight*' functions,
 * because all of those models contains directly sprint id attribute.
 *  - makeObjectRightExcludesprintday
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightGenericSprint = function(request, response, property, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token}, function(error, projectIds) {
            if (error) {
                return response.negotiate(error);
            } else {
                // Determine sprint ids for current user
                return sails.services['data']
                    .getCollectionProperty('sprint', 'id', {project: projectIds}, function(error, sprintIds) {
                        return sails.services['rights']
                            .makeObjectCondition(error, sprintIds, property, request, response, next);
                    });
            }
        });
};

/**
 * Generic object right helper function which will mutilate current where object
 * that way it contains necessary right checks. This is used to attach necessary
 * story limitation to query. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch story ids for those projects
 *  2) Mutilate current where condition:
 *      - if 'story' property exists in query remove not valid stories
 *      - if not add 'story' property to query with valid stories
 *
 * This helper function is called from following 'makeObjectRight*' functions,
 * because all of those models contains directly story id attribute.
 *  - makeObjectRightTask
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightGenericStory = function(request, response, property, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token}, function(error, projectIds) {
            if (error) {
                return response.negotiate(error);
            } else {
                // Determine sprint ids for current user
                return sails.services['data']
                    .getCollectionProperty('story', 'id', {project: projectIds}, function(error, storyIds) {
                        return sails.services['rights']
                            .makeObjectCondition(error, storyIds, property, request, response, next);
                    });
            }
        });
};

/**
 * Generic object right helper function which will mutilate current where object
 * that way it contains necessary right checks. This is used to attach necessary
 * story limitation to query. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch attached user ids for those projects
 *  2) Mutilate current where condition:
 *      - if 'user' property exists in query remove not valid users
 *      - if not add 'user' property to query with valid users
 *
 * This helper function is called from following 'makeObjectRight*' functions,
 * because all of those models contains directly user id attribute.
 *  - makeObjectRightUser
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightGenericUser = function(request, response, property, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token}, function(error, projectIds) {
            if (error) {
                return response.negotiate(error);
            } else {
                // Determine sprint ids for current user
                return sails.services['data']
                    .getCollectionProperty('projectuser', 'user', {project: projectIds}, function(error, userIds) {
                        return sails.services['rights']
                            .makeObjectCondition(error, userIds, property, request, response, next);
                    });
            }
        });
};

/**
 * Generic object right helper function which will mutilate current where object
 * that way it contains necessary right checks to models that has dynamic relations
 * to another models.
 *
 * Workflow with this is following:
 *  todo figure this out...
 *
 * This helper function is called from following 'makeObjectRight*' functions,
 * because all of those models contains 'objectName' and 'objectId' attributes
 *  - makeObjectRightComment
 *  - makeObjectRightFile
 *  - makeObjectRightHistory
 *  - makeObjectRightLink
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
exports.makeObjectRightGenericDynamic = function(request, response, next) {
    sails.log.verbose('This is not yet implemented...');

    return next();
};

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
        sails.log.err(' Error occurred while processing model row specified rights.');
        sails.log.err(error);

        return response.negotiate(error);
    }

    // Unique valid ID values
    validIds = _.uniq(validIds);

    // Determine name of the current model
    var model = request.options.model || request.options.controller;

    sails.log.verbose('Founded following valid ids \'' + validIds.join(', ') + '\' for model \'' + model + '\'.');

    // Make where condition against specified model property with determined id values
    var where = sails.services['rights']
        .makeConditionValidProperty(validIds, property, request);

    // There is no "valid" property values so we need to send 404 back to client
    if (_.isEmpty(where[property])) {
        sails.log.warn(' There is no valid ids for model query for current user...');

        error = new Error();

        error.message = 'Not found.';
        error.status = 404;

        return response.negotiate(error);
    }

    // Determine populate, limit and skip attributes
    var populate = request.param('populate');
    var limit = request.param('limit');
    var skip = request.param('skip');
    var sort = request.param('sort');

    sails.log.verbose('Original query object for model \'' + model + '\' is following:');
    sails.log.verbose(request.query);

    // Remove existing query
    delete request.query;

    // Set new query object to request, that blueprints will use after this
    request.query = {
        where: where,
        populate: populate,
        limit: limit,
        skip: skip,
        sort: sort
    };

    sails.log.verbose('Mutilated query object for model \'' + model + '\' is following:');
    sails.log.verbose(request.query);

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
