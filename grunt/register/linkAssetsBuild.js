/**
 * Grunt task configuration for 'linkAssetsBuild' job, this includes JS, CSS and HTML templates.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("linkAssetsBuild", [
        "sails-linker:devJsRelative",
        "sails-linker:devStylesRelative",
        "sails-linker:devTpl"
    ]);
};
