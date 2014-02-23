/**
 * Grunt task configuration for generic 'buildProd' job.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("buildProd", [
        "compileAssets",
        "concat",
        "uglify",
        "cssmin",
        "linkAssetsBuildProd",
        "clean:build",
        "copy:build"
    ]);
};
