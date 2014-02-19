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
     * Login action, basically this just shows login screen.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    login: function(req, res) {
        // If user is already signed in redirect to main page
        if (req.user) {
            res.redirect("/");
        }

        res.view();
    },

    /**
     * Logout action, just logout user and then redirect to root.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    logout: function(req, res) {
        req.logout();

        res.redirect("/login");
    },

    /**
     * Authentication action, this uses passport local directive to
     * check if user is valid user or not.
     *
     * @param   {Request}   req Request object
     * @param   {Response}  res Response object
     */
    authenticate: function(req, res) {
        passport.authenticate("local", function(error, user, info) {
            if ((error) || (!user)) {
                req.flash.message("Invalid credentials", "error");

                res.redirect("/login");
                return;
            }

            req.logIn(user, function(error) {
                if (error) {
                    req.flash.message("Login fail...", "error");

                    res.redirect("/login");
                } else {
                    // Update current session id to user data
                    User.update({id: user.id}, {sessionId: req.sessionID}, function(error, users) {
                        // Oh nou error
                        if (error) {
                            res.redirect("/logout");
                        } else { // Otherwise redirect user to main page
                            // Write user sign in log
                            LoggerService.userSignIn(user, req);

                            req.flash.message("Successfully sign in", "success");

                            res.redirect("/");
                        }
                    });
                }
            });
        })(req, res);
    }
};
