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

    var storyId = parseInt(request.param("id"), 10);
    var sprintId = parseInt(request.param("sprintId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Story id found, check that user has access to it
    if (!isNaN(storyId)) {
        AuthService.hasStoryAdmin(request.user, storyId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No admin right to story
                response.send("Insufficient rights to admin story.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(sprintId) && sprintId > 0) { // Check that current user has access to specified sprint
        AuthService.hasSprintAccess(request.user, sprintId, function(error, role) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else {
                // User has necessary role in project
                if (role !== false && role !== 0) {
                    sails.log.verbose("          OK");

                    next();
                } else {
                    response.send("Insufficient rights to admin story." , 403);
                }
            }
        }, true);
    } else if (!isNaN(projectId)) { // Check that current user has access to specified project
        AuthService.hasProjectAccess(request.user, projectId, function(error, role) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else {
                // User has necessary role in project
                if (role !== false && role !== 0) {
                    sails.log.verbose("          OK");

                    next();
                } else {
                    response.send("Insufficient rights to admin story.", 403);
                }
            }
        }, true);
    } else {
        response.send("Cannot identify story.", 403);
    }
};
