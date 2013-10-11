// api/policies/hasProjectAccess.js

/**
 * Policy to check if user has access to specified project or not. Actual check is
 * done by internal AuthService hasAccessToProject method.
 *
 * Note that this policy relies that project id is passed as projectId or id in
 * request object.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasProjectAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasProjectAccess.js");

    var projectId = parseInt(request.param("projectId"), 10);

    if (isNaN(projectId)) {
        projectId = parseInt(request.param("id"), 10);
    }

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
};
