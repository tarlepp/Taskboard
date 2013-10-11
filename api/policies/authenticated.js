// api/policies/authenticated.js

/**
 * Policy to check if user is signed in or not. We use passport to
 * determine if user is authenticated.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/authenticated.js");

    // All is ok, continue
    if (request.isAuthenticated()) {
        next();
    } else { // User not authenticated, redirect to login
        response.redirect("/login");
    }
};
