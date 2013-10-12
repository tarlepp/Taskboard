// api/policies/hasSprintAccess.js

/**
 * Policy to check if user has access to specified sprint or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAccess
 *  - hasSprintAccess
 *
 * Note that this policy relies that project id is passed as projectId or id in
 * request object.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasSprintAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasSprintAccess.js");

    var projectId = parseInt(request.param("projectId"), 10);

    // Check that user has access to specified project
    if (!isNaN(projectId)) {
        // Check that current user has access to specified project
        AuthService.hasProjectAccess(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to project
                response.send("Insufficient rights to access this project.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else { // Otherwise use id parameter straight to check if user has access to that sprint or not
        var sprintId = parseInt(request.param("id"), 10);

        // Check that current user has access to specified sprint
        AuthService.hasSprintAccess(request.user, sprintId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to project
                response.send("Insufficient rights to access this sprint.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    }
};

