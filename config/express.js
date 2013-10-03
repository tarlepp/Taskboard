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
        app.use(passport.initialize());
        app.use(passport.session());
    }
};