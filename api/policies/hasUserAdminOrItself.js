// api/policies/hasUserAdminOrItself.js

/**
 * Policy to check if user has admin rights to users or not. Basically this check
 * is very simply if user is not admin he/she don't have right to this,,,
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasUserAdminOrItself(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasUserAdminOrItself.js");

    var id = parseInt(request.param("id"), 10);
    var userId = parseInt(request.param("userId"), 10);

    userId = isNaN(userId) ? id : userId;

    // Only administrator users have right to admin users.
    if (request.user.admin || request.user.id === userId) {
        sails.log.verbose("          OK");

        next();
    } else {
        return ErrorService.makeErrorResponse(403, "Weird. You're not the one you present.", request, response);
    }
};
