// api/policies/hasUserAdminOrItself.js

/**
 * Policy to check if user has admin rights to users or not. Basically this check
 * is very simply if user is not admin he/she don't have right to this,,,
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasUserAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasUserAdminOrItself.js");

    var userId = parseInt(request.param("userId"), 10);

    if (isNaN(projectId)) {
        userId = parseInt(request.param("id"), 10);
    }

    // Only administrator users have right to admin users.
    if (request.user.admin || request.user.id === userId) {
        sails.log.verbose("          OK");

        next();
    } else {
        response.send("Weird. You're not the one you present.", 403);
    }
};
