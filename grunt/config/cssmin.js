/**
 * Configuration for Grunt to compress CSS files
 *
 * @see https://github.com/gruntjs/grunt-contrib-cssmin
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.config.set("cssmin", {
        dist: {
            src: [".tmp/public/concat/production.css"],
            dest: ".tmp/public/min/production.css"
        }
    });

    grunt.loadNpmTasks("grunt-contrib-cssmin");
};
