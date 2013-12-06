/**
 * /config/express.js
 *
 * This file contains all custom middlewares for Taskboard application.
 *
 * @type {*}
 */

var passport = require("passport");
var moment = require("moment-timezone");

module.exports.express = {
    customMiddleware: function (app) {
        // Add passport middleware
        app.use(passport.initialize());
        app.use(passport.session());

        // Add some basic data for all views
        app.use(function(req, res, next) {
            if (req.user && req.user.language) {
                moment.lang(req.user.language);
            }

            res.locals.currentUser = req.user;
            res.locals.moment = moment;

            next();
        });
    }
};