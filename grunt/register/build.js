/**
 * Grunt task configuration for generic 'build' job.
 * 
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("build", [
        "compileAssets",
        "linkAssetsBuild",
        "clean:build",
        "copy:build"
    ]);
};
