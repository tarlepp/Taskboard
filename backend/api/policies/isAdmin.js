'use strict';

/**
 * Policy to check if user is administrator. Note that this policy relies that
 * 'authenticated' and 'passport' policies are run before this one.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function(request, response, next) {
    sails.log.verbose(' POLICY - ' + __filename);

    // Token founded
    if (request.token) {
        sails.services['data'].getUser(request.token, function(error, user) {
            if (error) { // Error occurred
                sails.log.verbose('     ERROR - Data service getUser() method failed');

                next(error);
            } else if (user.admin) { // User is administrator, so continue
                sails.log.verbose("     OK");

                next();
            } else { // Otherwise send
                sails.log.verbose('     ERROR - User not an administrator');

                error = new Error();

                error.message = 'You are not administrator user.';
                error.status = 403;

                next(error);
            }
        });
    } else {
        sails.log.verbose('     ERROR - request token not found');

        var error = new Error();

        error.message = 'Request token not present.';
        error.status = 403;

        next(error);
    }
};
