'use strict';

/**
 * Policy to check if user is admin or user itself. This policy is used within 'User'
 * controller 'findOne' request. Note that policy relies to 'id' parameter to be user
 * id.
 *
 * @todo    do we need to support of another id parameters?
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function
 */
module.exports = function(request, response, next) {
    sails.log.verbose(' POLICY - ' + __filename + ':' + __line);

    var userId = parseInt(request.param('id'), 10);

    // User itself, continue
    if (userId === request.token) {
        sails.log.verbose("     OK");

        next();
    } else { // Otherwise we must check that user that made request is administrator user
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
                error.status = 404;

                next(error);
            }
        });
    }
};
