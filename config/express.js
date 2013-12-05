/**
 * /config/express.js
 *
 * This file contains all custom middlewares for Taskboard application.
 *
 * @type {*}
 */

var passport = require('passport');

module.exports.express = {
    customMiddleware: function (app) {
        // Add passport middleware
        app.use(passport.initialize());
        app.use(passport.session());

        // Add some basic data for all views
        app.use(function(req, res, next) {
            res.locals.currentUser = req.user;

            next();
        });
    }
};