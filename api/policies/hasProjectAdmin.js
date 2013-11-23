// api/policies/hasProjectAdmin.js

/**
 * Policy to check if user has admin right to specified project or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAdmin
 *
 * Note that this policy relies one of following parameters is present:
 *
 *  - id
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasProjectAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasProjectAdmin.js");

    var id = parseInt(request.param("id"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Project id parameter found
    if (!isNaN(id) || !isNaN(projectId)) {
        projectId = !isNaN(projectId) ? projectId : id;

        // Check that current user has access to specified project
        AuthService.hasProjectAdmin(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin right to project
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin this project.", request, response);
            } else {  // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify project.", request, response);
    }
};
