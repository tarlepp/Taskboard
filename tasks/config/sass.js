/**
 * Configuration for Grunt SASS job, this will compile all *.scss and *.sass files
 * to proper CSS files.
 *
 * @see https://github.com/gruntjs/grunt-contrib-sass
 *
 * @param grunt
 */
'use strict';

module.exports = function(grunt) {
    grunt.config.set('sass', {
        dev: {
            files: [
                {
                    expand: true,
                    cwd: 'assets/styles/',
                    src: ['*.scss', '*.sass'],
                    dest: '.tmp/public/styles/',
                    ext: '.css'
                }
            ]
        }
    });

    grunt.loadNpmTasks('grunt-contrib-sass');
};
