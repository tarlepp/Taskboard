// api/policies/hasMilestoneAccess.js

/**
 * Policy to check if user has access to specified milestone or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAccess
 *  - hasMilestoneAccess
 *
 * Note that this policy relies one of following parameters is present:
 *
 *  - id
 *  - milestoneId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasMilestoneAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasMilestoneAccess.js");

    var id = parseInt(request.param("id"), 10);
    var milestoneId = parseInt(request.param("milestoneId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Milestone id found, check that user has access to it
    if (!isNaN(id) || !isNaN(milestoneId)) {
        milestoneId = !isNaN(milestoneId) ? milestoneId : id;

        // Check that current user has access to specified sprint
        AuthService.hasMilestoneAccess(request.user, milestoneId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to project
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access milestone.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) { // Project id found
        // Check that current user has access to specified project
        AuthService.hasProjectAccess(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to project
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access milestone.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify milestone.", request, response);
    }
};

