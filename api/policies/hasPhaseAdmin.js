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
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin right to phase
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin phase.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(id) || !isNaN(phaseId)) { // Phase id found
        phaseId = !isNaN(phaseId) ? phaseId : id;

        // Check that current user has access to specified phase
        AuthService.hasPhaseAdmin(request.user, phaseId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No admin right to phase
                return ErrorService.makeErrorResponse(403, "Insufficient rights to admin phase.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify milestone.", request, response);
    }
};
