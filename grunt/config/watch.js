/**
 * Configuration for a grunt task to run predefined tasks whenever
 * watched file patterns are added, changed or deleted.
 *
 * @see https://github.com/gruntjs/grunt-contrib-uglify
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.config.set("watch", {
        api: {
            // API files to watch:
            files: ["api/**/*"]
        },
        assets: {
            // Assets to watch:
            files: ["assets/**/*"],

            // When assets are changed:
            tasks: ["syncAssets", "linkAssets"]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-watch");
};
