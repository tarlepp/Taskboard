/**
 * Configure advanced options for the Express server inside of Sails.
 *
 * For more information on configuration, check out:
 * http://sailsjs.org/#documentation
 */
'use strict';

var passport = require('passport');
var moment = require('moment-timezone');
var numeral = require('numeral');
var fs = require('fs');

module.exports.express = {
    // The middleware function used for parsing the HTTP request body.
    // (this most commonly comes up in the context of file uploads)
    //
    // Defaults to a slightly modified version of `express.bodyParser`, i.e.:
    // If the Connect `bodyParser` doesn't understand the HTTP body request
    // data, Sails runs it again with an artificial header, forcing it to try
    // and parse the request body as JSON.  (this allows JSON to be used as your
    // request data without the need to specify a 'Content-type: application/json'
    // header)
    //
    // If you want to change any of that, you can override the bodyParser with
    // your own custom middleware:
    // bodyParser: function customBodyParser (options) { ... },
    //
    // Or you can always revert back to the vanilla parser built-in to Connect/Express:
    // bodyParser: require('express').bodyParser,
    //
    // Or to disable the body parser completely:
    // bodyParser: false,
    // (useful for streaming file uploads-- to disk or S3 or wherever you like)
    //
    // WARNING
    // ======================================================================
    // Multipart bodyParser (i.e. express.multipart() ) will be removed
    // in Connect 3 / Express 4.
    // [Why?](https://github.com/senchalabs/connect/wiki/Connect-3.0)
    //
    // The multipart component of this parser will be replaced
    // in a subsequent version of Sails (after v0.10, probably v0.11) with:
    // [file-parser](https://github.com/mikermcneil/file-parser)
    // (or something comparable)
    //
    // If you understand the risks of using the multipart bodyParser,
    // and would like to disable the warning log messages, uncomment:
    // silenceMultipartWarning: true,
    // ======================================================================

    // Cookie parser middleware to use (or false to disable)
    //
    // Defaults to `express.cookieParser`
    //
    // Example override:
    // cookieParser: (function customMethodOverride (req, res, next) {})(),

    // HTTP method override middleware (or false to disable)
    //
    // This option allows artificial query params to be passed to trick
    // Sails into thinking a different HTTP verb was used.
    // Useful when supporting an API for user-agents which don't allow
    // PUT or DELETE requests
    //
    // Defaults to `express.methodOverride`
    //
    // Example override:
    // methodOverride: (function customMethodOverride (req, res, next) {})()

    customMiddleware: function(app) {
        // Add passport middleware and initialize it
        app.use(passport.initialize());
        app.use(passport.session());
        app.use(passport.authenticate('remember-me'));

        app.use(function(req, res, next) {
            if (req.user && req.user.language) {
                // Change moment language
                moment.lang(req.user.language);

                try {
                    // Change numeral language
                    numeral.language(req.user.language, require('../node_modules/numeral/languages/' + req.user.language + '.js'));
                    numeral.language(req.user.language);
                } catch (error) {
                    // Just silently ignore this error...
                }
            }

            // Set data to response locals, so those are accessible by any view
            res.locals.currentUser = req.user;
            res.locals.moment = moment;
            res.locals.numeral = numeral;
            res.locals.packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
            res.locals.inspect = require('util').inspect;

            next();
        });
    }
};
