/**
 * Grunt task configuration for generic "default" job.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("default", [
        "compileAssets",
        "linkAssets",
        "watch"
    ]);
};
