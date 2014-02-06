// api/policies/hasCommentObjectCreate.js

/**
 * Policy to check if user can create new comment or not. Actual check is done by one
 * of following internal AuthService methods;
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
 * We want to check that current user has at least "user" role in object project. Possible
 * user role values are:
 *
 *  -3      = Administrator
 *  -2      = Project manager primary
 *  -1      = Project manager (contributor)
 *   0      = Viewer
 *   1      = User
 *   false  = No access
 *
 * So this policy accept only role values -3, -2, -1 and 1
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasCommentObjectCreate(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasCommentObjectCreate.js");

    var objectId = parseInt(request.param("objectId"));
    var objectName = request.param("objectName");

    switch (objectName) {
        case "Project":
            AuthService.hasProjectAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (hasRight) { // User has right
                    sails.log.verbose("          OK");

                    return next();
                } else { // No right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights you need to be at least in 'user' role in this project.", request, response);
                }
            }, true);
            break;
        case "Milestone":
            AuthService.hasMilestoneAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (hasRight) { // User has right
                    sails.log.verbose("          OK");

                    return next();
                } else { // No right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights you need to be at least in 'user' role in this project.", request, response);
                }
            }, true);
            break;
        case "Sprint":
            AuthService.hasSprintAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (hasRight) { // User has right
                    sails.log.verbose("          OK");

                    return next();
                } else { // No right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights you need to be at least in 'user' role in this project.", request, response);
                }
            }, true);
            break;
        case "Story":
            AuthService.hasStoryAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (hasRight) { // User has right
                    sails.log.verbose("          OK");

                    return next();
                } else { // No right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights you need to be at least in 'user' role in this project.", request, response);
                }
            }, true);
            break;
        case "Task":
            AuthService.hasTaskAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (hasRight) { // User has right
                    sails.log.verbose("          OK");

                    return next();
                } else { // No right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights you need to be at least in 'user' role in this project.", request, response);
                }
            }, true);
            break;
        case "ExternalLink":
            AuthService.hasExternalLinkAccess(request.user, objectId, function(error, hasRight) {
                if (error) { // Error occurred
                    return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                } else if (hasRight) { // User has right
                    sails.log.verbose("          OK");

                    return next();
                } else { // No right to project
                    return ErrorService.makeErrorResponse(403, "Insufficient rights you need to be at least in 'user' role in this project.", request, response);
                }
            }, true);
            break;
        default:
            return ErrorService.makeErrorResponse(500, "Cannot determine object where you're trying to access...", request, response);
            break;
    }
};