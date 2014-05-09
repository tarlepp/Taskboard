'use strict';

module.exports = function(grunt) {
    grunt.registerTask('default', ['compileAssets', 'linkAssets', 'watch']);
};
