// api/policies/hasTaskAdmin.js

/**
 * Policy to check if user has admin rights to task or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasTaskAdmin
 *  - hasStoryAdmin
 *
 * Note that this policy relies one of following parameters are:
 *
 *  - id
 *  - taskId
 *  - storyId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasTaskAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasTaskAdmin.js");

    var id = parseInt(request.param("id"), 10);
    var taskId = parseInt(request.param("id"), 10);
    var storyId = parseInt(request.param("storyId"), 10);

    // Task id found, check that user has access to it
    if (!isNaN(id) || !isNaN(taskId)) {
        taskId = isNaN(taskId) ? id : taskId;

        // Check that user has admin access to task
        AuthService.hasTaskAdmin(request.user, taskId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin right to task
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin task.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(storyId) && storyId > 0) { // Check that current user has access to specified story
        AuthService.hasStoryAdmin(request.user, storyId, function(error, role) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else {
                // User has necessary role in project
                if (role !== false && role !== 0 && !isNaN(role)) {
                    sails.log.verbose("          OK");

                    next();
                } else {
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to admin task.", request, response);
                }
            }
        }, true);
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify task.", request, response);
    }
};
