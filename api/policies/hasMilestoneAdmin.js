// api/policies/hasMilestoneAdmin.js

/**
 * Policy to check if user has admin rights to milestone in specified project or not.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasMilestoneAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasMilestoneAdmin.js");

    var milestoneId = parseInt(request.param("id"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Check that current user has admin access to specified milestone
    if (!isNaN(milestoneId)) {
        AuthService.hasMilestoneAdmin(request.user, milestoneId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No admin rights
                response.send("Insufficient rights to admin milestone.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) { // Check that current user has update access to specified project
        AuthService.hasProjectAdmin(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No admin rights
                response.send("Insufficient rights to admin milestone.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        response.send("Cannot identify milestone.", 403);
    }
};
