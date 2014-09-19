'use strict';

/**
 * /api/services/RightsAdd.js
 *
 * Generic rights service which contains functions to restrict users add only
 * to specified objects on each model.
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
 * Service method to check if user has access to add new Comment object to
 * specified object + id combination or not.
 *
 * Note that all attached users of project are allowed to add new comments.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 *
 * @returns {*}
 */
exports.makeObjectRightAddComment = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddDynamic(request, response, [0, 1, 2], next);
};

/**
 * Service method to check if user has access to add new Epic object or not.
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
exports.makeObjectRightAddEpic = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to add new ExcludeSprintDay
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
exports.makeObjectRightAddExcludesprintday = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddSprint(request, response, 'sprint', [2], next);
};

/**
 * Service method to check if user has access to add new ExternalLink object
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
exports.makeObjectRightAddExternallink = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [1, 2], next);
};

/**
 * Service method to check if user has access to add new File object to
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
exports.makeObjectRightAddFile = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddDynamic(request, response, [1, 2], next);
};

/**
 * Service method to check if user has access to add new Link object to specified
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
exports.makeObjectRightAddLink = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddDynamic(request, response, [1, 2], next);
};

/**
 * Service method to check if user has access to add new Milestone object or
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
exports.makeObjectRightAddMilestone = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to add new Phase object or not.
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
exports.makeObjectRightAddPhase = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to add new ProjectUser object or not.
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
exports.makeObjectRightAddProjectuser = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to add new Sprint object or not.
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
exports.makeObjectRightAddSprint = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [2], next);
};

/**
 * Service method to check if user has access to add new Story object or not.
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
exports.makeObjectRightAddStory = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [1, 2], next);
};

/**
 * Service method to check if user has access to add new Task object or not.
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
exports.makeObjectRightAddTask = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddStory(request, response, 'story', [1, 2], next);
};

/**
 * Service method to check if user has access to add new TaskType object or not.
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
exports.makeObjectRightAddTasktype = function(request, response, next) {
    sails.log.verbose('RIGHT - ' + __filename + ':' + __line);

    return sails.services['rightsadd']
        .checkRightToAddProject(request, response, 'project', [2], next);
};

/**
 * Below is generic helper functions that this service will use.
 */

/**
 * Generic object right add helper function which will check that user has access
 * to add new object that has direct relation to 'project' model to database or
 * not. Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Check that given property (usually 'project') is in that collection
 *
 * This helper function is called from following 'makeObjectRightAdd*' functions,
 * because all of those models contains directly project id attribute.
 *  - makeObjectRightAddEpic
 *  - makeObjectRightAddExternallink
 *  - makeObjectRightAddMilestone
 *  - makeObjectRightAddPhase
 *  - makeObjectRightAddProjectuser
 *  - makeObjectRightAddSprint
 *  - makeObjectRightAddStory
 *  - makeObjectRightAddTasktype
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {[]}        roles       User role ids
 * @param   {Function}  next        Callback function
 */
exports.checkRightToAddProject = function(request, response, property, roles, next) {
    // Determine valid project ids for current user
    sails.services['data']
        .getCollectionProperty('projectuser', 'project', {user: request.token, role: roles}, function(error, projectIds) {
            return sails.services['rights']
                .checkRightProperty(error, projectIds, property, 'add', request, response, next);
        });
};

/**
 * Generic object right add helper function which will check that user has access
 * to add new object that has direct relation to 'sprint' model to database or not.
 * Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch sprint ids for those projects
 *  3) Check that given property (usually 'sprint') is in that collection
 *
 * This helper function is called from following 'makeObjectRightAdd*' functions,
 * because all of those models contains directly sprint id attribute.
 *  - makeObjectRightAddExcludesprintday
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {[]}        roles       User role ids
 * @param   {Function}  next        Callback function
 */
exports.checkRightToAddSprint = function(request, response, property, roles, next) {
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
                            .checkRightProperty(error, sprintIds, property, 'add', request, response, next);
                    });
            }
        });
};

/**
 * Generic object right add helper function which will check that user has access
 * to add new object that has direct relation to 'story' model to database or not.
 * Workflow with this is following:
 *
 *  1) Fetch project ids where current user is attached to
 *  2) Fetch story ids for those projects
 *  3) Check that given property (usually 'story') is in that collection
 *
 * This helper function is called from following 'makeObjectRightAdd*' functions,
 * because all of those models contains directly story id attribute.
 *  - makeObjectRightAddTask
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {String}    property    Property name
 * @param   {[]}        roles       User role ids
 * @param   {Function}  next        Callback function
 */
exports.checkRightToAddStory = function(request, response, property, roles, next) {
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
                            .checkRightProperty(error, storyIds, property, 'add', request, response, next);
                    });
            }
        });
};

/**
 * Generic object right add helper function which will check that user has access
 * to add new "dynamic" object to database or not. Note that this check is based
 * on following data attributes:
 *  - objectName (Project, Story, Sprint, etc.)
 *  - objectId (specified object id)
 *
 * Workflow with this is following:
 *  todo figure this out...
 *
 * This helper function is called from following 'makeObjectRightAdd*' functions,
 * because all of those models contains 'objectName' and 'objectId' attributes
 *  - makeObjectRightAddComment
 *  - makeObjectRightAddFile
 *  - makeObjectRightAddHistory
 *  - makeObjectRightAddLink
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {[]}        roles       Allowed user roles to project
 * @param   {Function}  next        Callback function
 */
exports.checkRightToAddDynamic = function(request, response, roles, next) {
    sails.log.verbose('This is not yet implemented...');

    return next();
};
