// api/policies/hasExcludeSprintDayAccess.js

/**
 * Policy to check if user has access to specified sprint exclude days or not. Actual check is
 * done by one of following internal AuthService methods;
 *
 *  - hasSprintAccess
 *
 * Note that this policy relies one of following parameters are:

 *  - sprintId
 *
 * Actual auth checks are done depending of given parameters.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasExcludeSprintDayAccess(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasExcludeSprintDayAccess.js");

    var id = parseInt(request.param("id"), 10);
    var sprintId = parseInt(request.param("sprintId"), 10);

    if (!isNaN(id)) {
        // Fetch exclude sprint day
        ExcludeSprintDay
            .findOne(id)
            .exec(function(error, day) {
                if (error) {
                    return ErrorService.makeErrorResponse(500, error, request, response);
                } else if (day) {
                    // Check that current user has access to specified sprint
                    AuthService.hasSprintAccess(request.user, day.sprintId, function(error, hasRight) {
                        if (error) { // Error occurred
                            return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
                        } else if (!hasRight) { // No access right to sprint
                            return ErrorService.makeErrorResponse(403, "Insufficient rights to access this sprint.", request, response);
                        } else { // Otherwise all is ok
                            sails.log.verbose("          OK");

                            next();
                        }
                    });
                } else {
                    return ErrorService.makeErrorResponse(403, "Cannot find sprint exclude day.", request, response);
                }
            });
    } else if (!isNaN(sprintId)) { // Sprint id given
        // Check that current user has access to specified sprint
        AuthService.hasSprintAccess(request.user, sprintId, function(error, hasRight) {
            if (error) { // Error occurred
                return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
            } else if (!hasRight) { // No access right to sprint
                return ErrorService.makeErrorResponse(403, "Insufficient rights to access this sprint.", request, response);
            } else { // Otherwise all is ok
                sails.log.verbose("          OK");

                next();
            }
        });
    } else {
        return ErrorService.makeErrorResponse(403, "Cannot identify sprint.", request, response);
    }
};

