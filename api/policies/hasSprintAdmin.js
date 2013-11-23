// api/policies/hasSprintAdmin.js

/**
 * Policy to check if user has admin rights to sprint in specified project or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasSprintAdmin
 *  - hasProjectAdmin
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
module.exports = function hasSprintAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasSprintAdmin.js");

    var id = parseInt(request.param("id"), 10);
    var sprintId = parseInt(request.param("sprintId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Id or sprint id given
    if (!isNaN(id) || !isNaN(sprintId)) {
        sprintId = !isNaN(sprintId) ? id : sprintId;

        AuthService.hasSprintAdmin(request.user, sprintId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin rights
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin this sprint.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) {
        // Check that current user has update access to specified project
        AuthService.hasProjectAdmin(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin rights
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin this sprint.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify sprint.", request, response);
    }
};
