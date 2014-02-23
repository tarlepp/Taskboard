/**
 * Grunt task configuration for assets jobs, this includes JS, CSS and HTML templates.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("linkAssets", [
        "sails-linker:devJs",
        "sails-linker:devStyles",
        "sails-linker:devTpl"
    ]);
};
