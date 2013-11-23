// api/policies/isAdministrator.js

/**
 * Policy to check if user is administrator or not.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function isAdministrator(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/isAdministrator.js");

    AuthService.isAdministrator(request.user, function(error, hasRight) {
        if (error) { // Error occurred
            return ErrorService.makeErrorResponse(error.status ? error.status : 500, error, request, response);
        } else if (!hasRight) { // No administrator rights
            return ErrorService.makeErrorResponse(403, "Insufficient rights you're not administrator.", request, response);
        } else { // Otherwise all is ok
            sails.log.verbose("          OK");

            next();
        }
    });
};
