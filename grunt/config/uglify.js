/**
 * Configuration for a grunt task to minify files with UglifyJS.
 *
 * @see https://github.com/gruntjs/grunt-contrib-uglify
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.config.set("uglify", {
        dist: {
            src: [".tmp/public/concat/production.js"],
            dest: ".tmp/public/min/production.js"
        }
    });

    grunt.loadNpmTasks("grunt-contrib-uglify");
};
