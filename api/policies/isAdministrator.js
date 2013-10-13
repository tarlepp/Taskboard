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
            response.send(error, error.status ? error.status : 500);
        } else if (!hasRight) { // No access right to task
            response.send("Insufficient rights you're not administrator.", 403);
        } else { // Otherwise all is ok
            sails.log.verbose("          OK");

            next();
        }
    });
};
