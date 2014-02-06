// api/policies/hasExternalLinkAccess.js

/**
 * Policy to check if user has access to specified project external link or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasExternalLinkAccess
 *  - hasProjectAccess
 *
 * Note that this policy relies one of following parameters is present:
 *
 *  - id
 *  - linkId
 *  - projectId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasExternalLinkAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasExternalLinkAccess.js");

    var id = parseInt(request.param("id"), 10);
    var linkId = parseInt(request.param("linkId"), 10);
    var projectId = parseInt(request.param("projectId"), 10);

    if (!isNaN(id) || !isNaN(linkId)) { // Link id found, check that user has access to it
        linkId = !isNaN(linkId) ? linkId : id;

        AuthService.hasExternalLinkAccess(request.user, linkId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to task
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access this project external link.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else if (!isNaN(projectId)) {
        AuthService.hasProjectAccess(request.user, projectId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to project
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access this project external link.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify external link.", request, response);
    }
};

