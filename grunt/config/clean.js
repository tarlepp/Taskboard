/**
 * Configuration for Grunt to clean all existing files from public folder.
 *
 * @see https://github.com/gruntjs/grunt-contrib-clean
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.config.set("clean", {
        dev: [".tmp/public/**"],
        build: ["www"]
    });

    grunt.loadNpmTasks("grunt-contrib-clean");
};
