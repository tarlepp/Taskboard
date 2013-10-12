// api/policies/hasMilestoneAccess.js

/**
 * Policy to check if user has access to specified milestone or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAccess
 *  - hasMilestoneAccess
 *
 * Note that this policy relies that project id is passed as projectId or id in
 * request object.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasMilestoneAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasMilestoneAccess.js");

    var milestoneId = parseInt(request.param("id"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Milestone id found, check that user has access to it
    if (!isNaN(milestoneId)) {
        // Check that current user has access to specified sprint
        AuthService.hasMilestoneAccess(request.user, milestoneId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to project
                response.send("Insufficient rights to access milestone.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) { // Project id found
        // Check that current user has access to specified project
        AuthService.hasProjectAccess(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error, error.status ? error.status : 500);
            } else if (!hasRight) { // No access right to project
                response.send("Insufficient rights to access project.", 403);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        response.send("Cannot identify milestone.", 403);
    }
};

