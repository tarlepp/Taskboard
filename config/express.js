/**
 * /config/express.js
 *
 * This file contains all custom middlewares for Taskboard application.
 *
 * @type {*}
 */

var passport = require("passport");
var moment = require("moment-timezone");
var numeral = require("numeral");
var fs = require("fs");

module.exports.express = {
    customMiddleware: function(app) {
        // Add passport middleware and initialize it
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(passport.authenticate("remember-me"));

        // Add some basic data for all views
        app.use(function(req, res, next) {
            if (req.user && req.user.language) {
                // Change moment language
                moment.lang(req.user.language);

                try {
                    // Change numeral language
                    numeral.language(req.user.language, require("../node_modules/numeral/languages/" + req.user.language + ".js"));
                    numeral.language(req.user.language);
                } catch (error) {
                    // Just silently ignore this error...
                }
            }

            // Set data to response locals, so those are accessible by any view
            res.locals.currentUser = req.user;
            res.locals.moment = moment;
            res.locals.numeral = numeral;
            res.locals.packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
            res.locals.inspect = require("util").inspect;

            next();
        });
    }
};