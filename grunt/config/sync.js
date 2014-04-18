/**
 * Configuration for a grunt task to keep directories in sync. It is very similar to
 * grunt-contrib-copy but tries to copy only those files that has actually changed.
 *
 * @see https://github.com/tomusdrw/grunt-sync
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.config.set("sync", {
        dev: {
            files: [
                {
                    cwd: "./assets",
                    src: ["**/*.!(coffee)"],
                    dest: ".tmp/public"
                }
            ]
        }
    });

    grunt.loadNpmTasks("grunt-sync");
};
