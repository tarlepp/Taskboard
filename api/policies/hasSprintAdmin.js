// api/policies/hasSprintAdmin.js

/**
 * Policy to check if user has admin rights to sprint in specified project or not.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasMilestoneAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasSprintAdmin.js");

    var sprintId = parseInt(request.param("id"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Check that current user has access to specified sprint
    if (!isNaN(sprintId)) {
        AuthService.hasSprintAdmin(request.user, sprintId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No admin rights
                response.send("Insufficient rights to admin sprint.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) {
        // Check that current user has update access to specified project
        AuthService.hasProjectUpdate(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No admin rights
                response.send("Insufficient rights to admin sprint.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        response.send("Cannot identify sprint.", 403);
    }
};
