/**
 * Module dependencies
 */
var Sails = require("sails");
var lifted = false;

global.sails = Sails;
global.lifted = lifted;
var app   = null;
var booting = false;

var sailsTestConfig = {
    log : { level: null }
};

module.exports.build = function liftSails(cb) {
    if(app) return cb(null, app);

    //If server has been booted but no app is loaded, try again.
    if(booting && !app) return setTimeout(function(){ liftSails(cb); }, 300);

    booting = true;
    Sails.lift(sailsTestConfig, function(err, sails) {
        app = sails;
        return cb(err, sails);
    });
};
