// api/policies/hasPhaseAdmin.js

/**
 * Policy to check if user has admin rights to phases or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAdmin
 *  - hasPhaseAdmin
 *
 * Note that this policy relies one of following parameters are:
 *
 *  - id
 *  - phaseId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasTaskAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasPhaseAdmin.js");

    var id = parseInt(request.param("id"), 10);
    var phaseId = parseInt(request.param("phaseId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    // Project id found, check that user has access to it
    if (!isNaN(projectId)) {
        AuthService.hasProjectAdmin(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error.status ? error.status : 500, error);
            } else if (!hasRight) { // No admin right to phase
                response.send(403, "Insufficient rights to admin phase.");
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(id) || !isNaN(phaseId)) { // Check that current user has access to specified phase
        phaseId = isNaN(phaseId) ? id : phaseId;

        AuthService.hasPhaseAdmin(request.user, phaseId, function(error, hasRight) {
            if (error) { // Error occurred
                response.send(error.status ? error.status : 500, error);
            } else if (!hasRight) { // No admin right to phase
                response.send(403, "Insufficient rights to admin phase.");
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        response.send(403, "Cannot identify phase.");
    }
};
