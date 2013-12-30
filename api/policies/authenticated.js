// api/policies/authenticated.js

/**
 * Policy to check if user is signed in or not. We use passport to determine if user is authenticated.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/authenticated.js");

    // All is ok, continue
    if (request.isAuthenticated()) {
        /**
         * Check that current user session ID is exactly same with user model.
         *
         * @todo
         * Note that this doesn't work on socket request, have to solve this someway later...
         */
        if (request.sessionID && request.sessionID !== request.user.sessionId) {
            request.flash.message("Someone else have been signed in with same credentials.", "error");

            return response.redirect("/logout");
        }

        sails.log.verbose("          OK");
        next();
    } else { // User not authenticated, redirect to login
        return response.redirect("/login");
    }
};
