// api/policies/hasProjectUpdate.js

/**
 * Policy to check if user has update right to specified project or not. Actual check is
 * done by internal AuthService hasProjectUpdate method.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasProjectUpdate(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasProjectUpdate.js");

    var projectId = parseInt(request.param("id"), 10);

    // Check that current user has access to specified project
    AuthService.hasProjectUpdate(request.user, projectId, function(error, hasRight) {
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
