/**
 * Grunt task configuration for "linkAssetsBuildProd" job, this includes JS, CSS and HTML templates.
 *
 * @param grunt
 */
"use strict";

module.exports = function(grunt) {
    grunt.registerTask("linkAssetsBuildProd", [
        "sails-linker:prodJsRelative",
        "sails-linker:prodStylesRelative",
        "sails-linker:devTpl"
    ]);
};
