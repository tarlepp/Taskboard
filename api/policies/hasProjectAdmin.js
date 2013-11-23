// api/policies/hasProjectAdmin.js

/**
 * Policy to check if user has admin right to specified project or not. Actual check is
 * done by internal AuthService hasProjectAdmin method.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasProjectUpdate(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasProjectAdmin.js");

    var projectId = parseInt(request.param("projectId"), 10);

    if (isNaN(projectId)) {
        projectId = parseInt(request.param("id"), 10);
    }

    if (isNaN(projectId)) {
        response.send(400, "Cannot verify policy.");
    }

    // Check that current user has access to specified project
    AuthService.hasProjectAdmin(request.user, projectId, function(error, hasRight) {
        if (error) { // Error occurred
            response.send(error, error.status ? error.status : 500);
        } else if (!hasRight) { // No update right to project
            response.send("Insufficient rights to update this project.", 403);
        } else {  // Otherwise all is ok
            sails.log.verbose("          OK");

            next();
        }
    });
};
