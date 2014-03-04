/**
 * AuthController
 *
 * @module      :: Controller
 * @description :: Contains logic for handling requests.
 */
"use strict";

var passport = require("passport");

module.exports = {
    /**
     * Overrides for the settings in `config/controllers.js`
     * (specific to AuthController)
     */
    _config: {
        blueprints: {
            rest: false
        }
    },

    /**
     * Login action, this will just shows login screen if user isn't logged in yet.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    login: function(request, response) {
        // If user is already signed in redirect to main page
        if (request.user) {
            response.redirect("/");
        }

        response.view();
    },

    /**
     * Logout action, just logout user and then redirect back to login page.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    logout: function(request, response) {
        request.logout();

        response.redirect("/login");
    },

    /**
     * Authentication action, this uses passport local directive to check if user is valid user or not.
     *
     * @todo how to support multiple authentication directives?
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    authenticate: function(request, response) {
        passport.authenticate("local", function(error, user, info) {
            if ((error) || (!user)) {
                sails.log.error("Login failed: " + __filename + ":" + __line);
                sails.log.error(info);

                request.flash.message("Invalid credentials", "error");

                response.redirect("/login");
                return;
            }

            request.logIn(user, function(error) {
                if (error) {
                    sails.log.error("Login failed: " + __filename + ":" + __line);
                    sails.log.error(error);

                    request.flash.message("Login fail...", "error");

                    response.redirect("/login");
                } else {
                    // Update current session id to user data
                    User.update({id: user.id}, {sessionId: request.sessionID}, function(error, users) {
                        // Oh nou error
                        if (error || users.length !== 1) {
                            sails.log.error("Login failed: " + __filename + ":" + __line);
                            sails.log.error(error);

                            response.redirect("/logout");
                        } else { // Otherwise redirect user to main page
                            // Write user sign in log
                            LoggerService.userSignIn(user, request);

                            request.flash.message("Successfully sign in", "success");

                            response.redirect("/");
                        }
                    });
                }
            });
        })(request, response);
    }
};
