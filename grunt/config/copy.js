/**
 * Configuration for Grunt to copy files and folders.
 *
 * @see https://github.com/gruntjs/grunt-contrib-copy
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.config.set("copy", {
        dev: {
            files: [
                {
                    expand: true,
                    cwd: "./assets",
                    src: ["**/*.!(coffee|less)"],
                    dest: ".tmp/public"
                }
            ]
        },
        build: {
            files: [
                {
                    expand: true,
                    cwd: ".tmp/public",
                    src: ["**/*"],
                    dest: "www"
                }
            ]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-copy");
};
