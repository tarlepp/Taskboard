// api/policies/hasCommentObjectAccess.js

/**
 * Policy to check if user has access to specified comment object or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasProjectAccess
 *  - hasMilestoneAccess
 *  - hasSprintAccess
 *  - hasStoryAccess
 *  - hasTaskAccess
 *
 * Note that this policy relies that following parameters are present:
 *
 *  - objectId
 *  - objectName
 *
 * So in this check it is just needed that user is attached to project in some role.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasCommentObjectAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasCommentObjectAccess.js");

    var objectId = parseInt(request.param("objectId"));

    switch (request.param("objectName")) {
        case "Project":
            AuthService.hasProjectAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (!hasRight) { // No access right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to access this project.", request, response);
                } else { // Otherwise all is ok
                    sails.log.verbose("          OK");

                    return next();
                }
            });
            break;
        case "Milestone":
            AuthService.hasMilestoneAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (!hasRight) { // No access right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to access milestone.", request, response);
                } else { // Otherwise all is ok
                    sails.log.verbose("          OK");

                    return next();
                }
            });
            break;
        case "Sprint":
            AuthService.hasSprintAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (!hasRight) { // No access right to sprint
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to access this sprint.", request, response);
                } else { // Otherwise all is ok
                    sails.log.verbose("          OK");

                    return next();
                }
            });
            break;
        case "Story":
            AuthService.hasStoryAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (!hasRight) { // No access right to story
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to access story.", request, response);
                } else { // Otherwise all is ok
                    sails.log.verbose("          OK");

                    return next();
                }
            });
            break;
        case "Task":
            AuthService.hasTaskAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (!hasRight) { // No access right to task
                    return ErrorService.makeErrorResponse(403, "Insufficient rights to access task.", request, response);
                } else { // Otherwise all is ok
                    sails.log.verbose("          OK");

                    return next();
                }
            });
            break;
        default:
            return ErrorService.makeErrorResponse(500, "Cannot determine object where you're trying to access...", request, response);
            break;
    }
};