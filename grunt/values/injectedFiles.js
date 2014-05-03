/**
 * CSS files to inject in order
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * By default, Sails also supports LESS in development and production.
 * To use SASS/SCSS, Stylus, etc., edit the `sails-linker:devStyles` task
 * below for more options.  For this to work, you may need to install new
 * dependencies, e.g. `npm install grunt-contrib-sass`
 */
"use strict";

var cssFilesToInject = [
    // jQuery specified libraries
    "bower_components/qtip2/jquery.qtip.min.css",

    // Bootstrap specified libraries
    "bower_components/bootstrap/dist/css/bootstrap.min.css",
    "bower_components/bootstrap/dist/css/bootstrap-theme.min.css",
    "bower_components/bootstrap-datepicker/css/datepicker3.css",
    "bower_components/bootstrap-select/bootstrap-select.min.css",

    // Angular specified libraries
    "bower_components/ng-prettyjson/dist/ng-prettyjson.min.css",

    // Individual libraries
    "bower_components/font-awesome/css/font-awesome.min.css",

    // Add everything else
    "styles/**/*.css"
];

/**
 * Javascript files to inject in order
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * To use client-side CoffeeScript, TypeScript, etc., edit the
 * `sails-linker:devJs` task below for more options.
 */

var jsFilesToInject = [
    // Below, as a demonstration, you"ll see the built-in dependencies
    // linked in the proper order order

    // Bring in the socket.io client
    "js/socket.io.js",

    // then beef it up with some convenience logic for talking to Sails.js
    "js/sails.io.js",

    // Individual libraries
    "bower_components/async/lib/async.js",
    "bower_components/json5/lib/json5.js",
    "bower_components/lodash/dist/lodash.min.js",
    "bower_components/moment/min/moment-with-langs.min.js",
    "bower_components/moment-timezone/min/moment-timezone.min.js",

    // jQuery specified libraries
    "bower_components/jquery/dist/jquery.min.js",
    "bower_components/noty/js/noty/packaged/jquery.noty.packaged.js",
    "bower_components/qtip2/jquery.qtip.min.js",

    // Angular specified libraries
    "bower_components/angular/angular.js",
    "bower_components/angular-bootstrap/ui-bootstrap-tpls.js",
    "bower_components/angular-cookie/angular-cookie.js",
    "bower_components/angular-cookies/angular-cookies.js",
    "bower_components/angular-moment/angular-moment.min.js",
    "bower_components/angular-resource/angular-resource.js",
    "bower_components/angular-route/angular-route.min.js",
    "bower_components/angular-route-segment/build/angular-route-segment.js",
    "bower_components/angular-sails/dist/angular-sails.min.js",
    "bower_components/angular-sanitize/angular-sanitize.js",
    "bower_components/angular-ui-router/release/angular-ui-router.js",
    "bower_components/angularjs-gravatar/dist/angularjs-gravatardirective.min.js",
    "bower_components/ng-prettyjson/dist/ng-prettyjson.min.js",

    // Bootstrap specified libraries
    "bower_components/bootstrap/dist/js/bootstrap.min.js",
    "bower_components/bootstrap-datepicker/js/bootstrap-datepicker.js",
    "bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.fi.js",
    "bower_components/bootstrap-datepicker/js/locales/bootstrap-datepicker.en.js",
    "bower_components/bootstrap-hover-dropdown/bootstrap-hover-dropdown.min.js",
    "bower_components/bootstrap-select/bootstrap-select.min.js",

    // Individual components, that doesn't have bower sources.
    "vendor/angularSails/dist/ngsails.js",
    "vendor/angularSails/dist/ngsails.resource.js",

    // TaskBoard application specified files that must be loaded in this order
    "js/application.js",
    "js/taskboard.js",

    // All of the rest of your app scripts imported here
    "js/**/*.js"
];

/**
 * Client-side HTML templates are injected using the sources below
 * The ordering of these templates shouldn"t matter.
 * (uses Grunt-style wildcard/glob/splat expressions)
 *
 * By default, Sails uses JST templates and precompiles them into
 * functions for you.  If you want to use jade, handlebars, dust, etc.,
 * edit the relevant sections below.
 */
var templateFilesToInject = [
    "template/**/*.html"
];

module.exports = {
    // Modify css file injection paths to use
    cssFilesToInject: cssFilesToInject.map(function(path) {
        return ".tmp/public/" + path;
    }),

    // Modify js file injection paths to use
    jsFilesToInject: jsFilesToInject.map(function(path) {
        return ".tmp/public/" + path;
    }),

    templateFilesToInject: templateFilesToInject.map(function(path) {
        return "assets/" + path;
    })
};
