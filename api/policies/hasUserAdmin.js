// api/policies/hasUserAdmin.js

/**
 * Policy to check if user has admin rights to users or not. Basically this check
 * is very simply if user is not admin he/she don't have right to this,,,
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function hasUserAdmin(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/hasUserAdmin.js");

    // Only administrator users have right to admin users.
    if (request.user.admin) {
        sails.log.verbose("          OK");

        next();
    } else {
        response.send("Insufficient rights to admin users.", 403);
    }
};
