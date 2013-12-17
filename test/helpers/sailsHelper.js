"use strict";

// Module dependencies
var request = require("supertest");
var Sails = require("sails");

// Initialize some default variables
var app = null;
var lifted = false;
var booting = false;

// Globals to use in testing, these are necessary
global.sails = Sails;
global.lifted = lifted;

/**
 * Configuration for testing sails app
 *
 * @type {{}}
 */
var sailsTestConfig = {
    log: {
        level: null
    }
};

/**
 * Builder for sails.js application for tests.
 *
 * @param   {Function}  next    Callback function to call after sails are lifted!
 */
module.exports.build = function liftSails(next) {
    // Application already up so just call next
    if (app) {
        return next(null, app);
    }

    // If server has been booted but no app is loaded, try again after a short moment.
    if(booting && !app) {
        return setTimeout(function() { liftSails(next); }, 300);
    }

    // Yeah, we're booting up
    booting = true;

    // Lift sails!
    Sails.lift(sailsTestConfig, function(error, sails) {
        app = sails;

        return next(error, sails);
    });
};

/**
 * Getter method for CSRF token which must be used with Taskboard application.
 *
 * @param   {Function}  next    Callback function to call after CSRF token is fetched
 */
module.exports.getCsrfToken = function(next) {
    request(sails.express.server)
        .get("/csrfToken")
        .end(function (error, result) {

            return next(error, result.body._csrf);
        });
};
