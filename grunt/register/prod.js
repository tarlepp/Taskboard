/**
 * Grunt task configuration for "prod" job.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("prod", [
        "compileAssets",
        "concat",
        "uglify",
        "cssmin",
        "sails-linker:prodJs",
        "sails-linker:prodStyles",
        "sails-linker:devTpl"
    ]);
};
