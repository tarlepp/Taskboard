'use strict';

/**
 * /api/services/RightsMod.js
 *
 * Generic rights service which contains functions to restrict users modify only
 * to specified objects on each model. This service is used by 'objectRightMod'
 * policy.
 *
 * User roles ara following:
 *
 *  0 = Viewer
 *  1 = Contributor
 *  2 = Administrator
 */

var _ = require('lodash');
var actionUtil = require('sails/lib/hooks/blueprints/actionUtil');

/**
 * Service method to check if user has access to modify Comment object to
 * specified object + id combination or not.
 *
 * With in this we need to check that request user is one of following:
 *  1) Comment creator
 *  2) Project administrator
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModComment = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModDynamic(request, response, [2], next);
};

/**
 * Service method to check if user has access to modify Epic object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModEpic = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to modify ExcludeSprintDay
 * object or not. This check relies to 'sprint' property of sent data. This
 * property value must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModExcludesprintday = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModSprint(request, response, 'sprint', [2], next);
};

/**
 * Service method to check if user has access to modify ExternalLink object
 * or not. This check relies to 'project' property of sent data. This property
 * value must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' or 'contributor'
 * role on that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModExternallink = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [1, 2], next);
};

/**
 * Service method to check if user has access to modify File object to
 * specified object + id combination or not.
 *
 * This action is allowed only to users that are 'administrator' or 'contributor'
 * role on that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModFile = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModDynamic(request, response, [1, 2], next);
};

/**
 * Service method to check if user has access to modify Link object to specified
 * object + id combination or not.
 *
 * This action is allowed only to users that are 'administrator' or 'contributor'
 * role on that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModLink = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModDynamic(request, response, [1, 2], next);
};

/**
 * Service method to check if user has access to modify Milestone object or
 * not. This check relies to 'project' property of sent data. This property
 * value must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModMilestone = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to modify Phase object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModPhase = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to modify Project object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModProject = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'id', [2], next);
};

/**
 * Service method to check if user has access to modify ProjectUser object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModProjectuser = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to modify Sprint object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModSprint = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to modify Story object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' or 'contributor'
 * role on that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModStory = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [1, 2], next);
};

/**
 * Service method to check if user has access to modify Task object or not.
 * This check relies to 'story' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' or 'contributor'
 * role on that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModTask = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModStory(request, response, 'story', [1, 2], next);
};

/**
 * Service method to check if user has access to modify TaskType object or not.
 * This check relies to 'project' property of sent data. This property value
 * must be one of those that user has access to.
 *
 * This action is allowed only to users that are 'administrator' role on
 * that project.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightModTasktype = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsmod']
        .checkRightToModProject(request, response, 'project', [2], next);
};

/**
 * Below is generic helper functions that this service will use.
 */

/**
 * Generic object right modify helper function which will check that user has access
 * to modify specified object that has direct relation to 'project' model to database
 * or not. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Check that given property (usually 'project') is in that collection
 *
 * This helper function is called from following 'makeObjectRightMod*' functions,
 * because all of those models contains directly project id attribute.
 *  - makeObjectRightModEpic
 *  - makeObjectRightModExternallink
 *  - makeObjectRightModMilestone
 *  - makeObjectRightModPhase
 *  - makeObjectRightModProjectuser
 *  - makeObjectRightModSprint
 *  - makeObjectRightModStory
 *  - makeObjectRightModTasktype
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {[]}        roles       User role ids
 * @param   {Function}  next        Callback function
 */
exports.checkRightToModProject = function(request, response, property, roles, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token, role: roles}, function(error, projectIds) {
            return sails.services['rights']
                .checkRightProperty(error, projectIds, property, 'mod', request, response, next);
        });
};

/**
 * Generic object right modify helper function which will check that user has access
 * to modify object that has direct relation to 'sprint' model to database or not.
 * Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch sprint ids for those projects
 *  3) Check that given property (usually 'sprint') is in that collection
 *
 * This helper function is called from following 'makeObjectRightMod*' functions,
 * because all of those models contains directly sprint id attribute.
 *  - makeObjectRightModExcludesprintday
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {[]}        roles       User role ids
 * @param   {Function}  next        Callback function
 */
exports.checkRightToModSprint = function(request, response, property, roles, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token, role: roles}, function(error, projectIds) {
            if (error) {
                return response.negotiate(error);
            } else {
                // Determine sprint ids for current user
                return sails.services['data']
                    .getCollectionProperty('sprint', 'id', {project: projectIds}, function(error, sprintIds) {
                        return sails.services['rights']
                            .checkRightProperty(error, sprintIds, property, 'mod', request, response, next);
                    });
            }
        });
};

/**
 * Generic object right modify helper function which will check that user has access
 * to modify object that has direct relation to 'story' model to database or not.
 * Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch story ids for those projects
 *  3) Check that given property (usually 'story') is in that collection
 *
 * This helper function is called from following 'makeObjectRightMod*' functions,
 * because all of those models contains directly story id attribute.
 *  - makeObjectRightModTask
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {[]}        roles       User role ids
 * @param   {Function}  next        Callback function
 */
exports.checkRightToModStory = function(request, response, property, roles, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token, role: roles}, function(error, projectIds) {
            if (error) {
                return response.negotiate(error);
            } else {
                // Determine sprint ids for current user
                return sails.services['data']
                    .getCollectionProperty('story', 'id', {project: projectIds}, function(error, storyIds) {
                        return sails.services['rights']
                            .checkRightProperty(error, storyIds, property, 'mod', request, response, next);
                    });
            }
        });
};

/**
 * Generic object right mod helper function which will check that user has access
 * to modify new "dynamic" object to database or not. Note that this check is based
 * on following data attributes:
 *  - objectName (Project, Story, Sprint, etc.)
 *  - objectId (specified object id)
 *
 * Workflow with this is following:
 *  todo figure this out...
 *
 * This helper function is called from following 'makeObjectRightMod*' functions,
 * because all of those models contains 'objectName' and 'objectId' attributes
 *  - makeObjectRightModComment
 *  - makeObjectRightModFile
 *  - makeObjectRightModHistory
 *  - makeObjectRightModLink
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {[]}        roles       Allowed user roles to project
 * @param   {Function}  next        Callback function
 */
exports.checkRightToModDynamic = function(request, response, roles, next) {
    sails.log.verbose('This is not yet implemented...');

    return next();
};