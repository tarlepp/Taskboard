/**
 * Grunt task configuration for "syncAssets" job.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("syncAssets", [
        "jst:dev",
        "less:dev",
        "sass:dev",
        "sync:dev",
        "coffee:dev"
    ]);
};
