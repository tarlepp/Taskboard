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
    sails.log.verbose(' POLICY - ' + __filename);

    var userId = parseInt(request.param('id'), 10);

    // User itself, continue
    if (userId === request.token) {
        next();
    } else { // Otherwise we must check that user that made request is administrator user
        DataService.getUser(request.token, function(error, user) {
            if (error) { // Error occurred
                next(error);
            } else if (user.admin) { // User is administrator, so continue
                next();
            } else { // Otherwise send
                error = new Error();

                error.message = 'You are not administrator user.';
                error.status = 404;

                next(error);
            }
        });
    }
};
