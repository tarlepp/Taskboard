// api/policies/hasSprintCreate.js

/**
 * Policy to check if user has create right no new sprint to specified project or not.
 * Actual check is done by internal AuthService hasSprintCreate method.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasSprintCreate(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasSprintCreate.js");

    var projectId = parseInt(request.param("projectId"), 10);

    // Check that current user has access to specified sprint
    AuthService.hasSprintCreate(request.user, projectId, function(error, hasRight) {
        if (error) { // Error occurred
            response.send(error, error.status ? error.status : 500);
        } else if (!hasRight) { // No create right to create sprint
            response.send("Insufficient rights to create new sprint to this project.", 403);
        } else { // Otherwise all is ok
            sails.log.verbose("          OK");

            next();
        }
    });
};
