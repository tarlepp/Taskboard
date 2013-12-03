// api/policies/hasSprintAccess.js

/**
 * Policy to check if user has access to specified sprint or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAccess
 *  - hasSprintAccess
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
module.exports = function hasSprintAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasSprintAccess.js");

    var id = parseInt(request.param("id"), 10);
    var sprintId = parseInt(request.param("sprintId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Id or sprint id given
    if (!isNaN(id) || !isNaN(sprintId)) {
        sprintId = !isNaN(sprintId) ? sprintId : id;

        // Check that current user has access to specified sprint
        AuthService.hasSprintAccess(request.user, sprintId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to sprint
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access this sprint.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) { // Project id given
        // Check that current user has access to specified project
        AuthService.hasProjectAccess(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to project
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access this sprint.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify sprint.", request, response);
    }
};

