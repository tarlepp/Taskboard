// api/policies/hasSprintDestroy.js

/**
 * Policy to check if user has delete right to specified sprint or not. Actual check is
 * done by internal AuthService hasSprintDestroy method.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasSprintDestroy(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasSprintDestroy.js");

    var sprintId = parseInt(request.param("id"), 10);

    // Check that current user has access to specified sprint
    AuthService.hasSprintDestroy(request.user, sprintId, function(error, hasRight) {
        if (error) { // Error occurred
            response.send(error, error.status ? error.status : 500);
        } else if (!hasRight) { // No destroy right to sprint
            response.send("Insufficient rights to destroy this sprint.", 403);
        } else { // Otherwise all is ok
            sails.log.verbose("          OK");

            next();
        }
    });
};
