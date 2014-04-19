/**
 * AuthController.js 
 *
 * @description ::
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */
"use strict";

var passport = require("passport");

module.exports = {
    /**
     * Action to check if user is authenticated or not. This action is called by Angular
     * application within every route to ensure that user has signed in. If not angular
     * will redirect user back to sign in page.
     *
     * Action will output user data as a JSON object if he / she is signed in to application
     * otherwise JSON output contains just 'false' and HTTP 401 headers are sent.
     *
     * @see /assets/js/application.js
     *
     * @param   {Request}   request
     * @param   {Response}  response
     * @constructor
     */
    authenticate: function(request, response) {
        try {
            if (request.isAuthenticated()) {
                response.json(request.user, 200);
            } else {
                sails.log.warning(__filename + ":" + __line + " [User is not authenticated]");

                response.json(false, 401);
            }
        } catch (error) {
            sails.log.error(error);

            response.json(false, 401);
        }
    },

    /**
     * Logout action, just logout user and then redirect back to login page.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    logout: function(request, response) {
        response.clearCookie("remember_me");
        request.logout();

        response.send(200);
    },

    /**
     * Authentication action, this uses passport local directive to check if user is valid user or not.
     *
     * @param   {Request}   request     Request object
     * @param   {Response}  response    Response object
     */
    login: function(request, response) {
        var message = "";

        passport.authenticate("local", function(error, user, info) {
            if ((error) || (!user)) {
                sails.log.error(__filename + ":" + __line + " [Login failed]");

                if (error) {
                    sails.log.error(error);
                }

                if (info) {
                    sails.log.error(info);
                }

                message = {message: "Invalid credentials", type: "error", options: {}};

                response.json(message, 401);

                return;
            }

            request.logIn(user, function(error) {
                if (error) {
                    sails.log.error(__filename + ":" + __line + " [Login failed]");
                    sails.log.error(error);

                    message = {message: "Sign in failed...", type: "error", options: {}};

                    response.json(message, 401);
                } else {
                    // Update current session id to user data
                    User.update({id: user.id}, {sessionId: request.sessionID}, function(error, users) {
                        // Oh nou error
                        if (error || users.length !== 1) {
                            sails.log.error(__filename + ":" + __line + " [Login failed - cannot update user data]");
                            sails.log.error(error);

                            message = {message: "Sign in failed...", type: "error", options: {}};

                            response.json(message, 401);
                        } else { // Otherwise redirect user to main page
                            // Write user sign in log
                            LoggerService.userSignIn(user, request);

                            if (request.param("rememberMe")) {
                                AuthService.issueToken(user, function(error, token) {
                                    if (error) {
                                        sails.log.error(__filename + ":" + __line + " [Login failed - cannot issue token]");
                                        sails.log.error(error);
                                    } else {
                                        response.cookie("remember_me", token, { path: "/", httpOnly: true, maxAge: 604800000 });
                                    }
                                });
                            }

                            message = {message: "Successfully sign in", type: "success", options: {}};

                            response.json(users[0]);
                        }
                    });
                }
            });
        })(request, response);
    }
};
