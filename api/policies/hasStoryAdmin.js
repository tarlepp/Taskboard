// api/policies/hasStoryAdmin.js

/**
 * Policy to check if user has admin rights to story or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasStoryAdmin
 *  - hasSprintAccess
 *  - hasProjectAccess
 *
 * Note that this policy relies one of following parameters are:
 *
 *  - id
 *  - storyId
 *  - sprintId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasStoryAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasStoryAdmin.js");

    var id = parseInt(request.param("id"), 10);
    var storyId = parseInt(request.param("storyId"), 10);
    var sprintId = parseInt(request.param("sprintId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Story id given
    if (!isNaN(id) || !isNaN(storyId)) {
        storyId = isNaN(storyId) ? id : storyId;

        // Check that user has admin right to specified story
        AuthService.hasStoryAdmin(request.user, storyId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin right to story
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin story.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(sprintId) && sprintId > 0) { // Sprint id given
        // Check that current user has access to specified sprint
        AuthService.hasSprintAccess(request.user, sprintId, function(error, role) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else {
                // User has necessary role in project
                if (role !== false && role !== 0 && !isNaN(role)) {
                    sails.log.verbose("          OK");

                    next();
                } else {
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to admin story.", request, response);
                }
            }
        }, true);
    } else if (!isNaN(projectId)) { // Project id given
        // Check that current user has access to specified project
        AuthService.hasProjectAccess(request.user, projectId, function(error, role) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else {
                // User has necessary role in project
                if (role !== false && role !== 0 && !isNaN(role)) {
                    sails.log.verbose("          OK");

                    next();
                } else {
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to admin story.", request, response);
                }
            }
        }, true);
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify story.", request, response);
    }
};
