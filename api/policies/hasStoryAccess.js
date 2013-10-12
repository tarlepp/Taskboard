// api/policies/hasStoryAccess.js

/**
 * Policy to check if user has access to specified story or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasStoryAccess
 *  - hasSprintAccess
 *  - hasProjectAccess
 *
 * Note that this policy relies one of following parameters are:
 *
 *  - id
 *  - sprintId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasStoryAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasStoryAccess.js");

    var storyId = parseInt(request.param("id"), 10);
    var sprintId = parseInt(request.param("sprintId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Story id found, check that user has access to it
    if (!isNaN(storyId)) {
        AuthService.hasStoryAccess(request.user, storyId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to story
                response.send("Insufficient rights to access story.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(sprintId) && sprintId > 0) { // Check that current user has access to specified story
        AuthService.hasSprintAccess(request.user, sprintId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to story
                response.send("Insufficient rights to access story.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) { // Check that current user has access to specified story
        AuthService.hasProjectAccess(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to story
                response.send("Insufficient rights to access story.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        response.send("Cannot identify story.", 403);
    }
};

