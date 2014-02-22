/**
 * Configuration for Grunt to compile CoffeeScript files.
 *
 * @see https://github.com/gruntjs/grunt-contrib-coffee
 *
 * @param grunt
 */
module.exports = function(grunt) {
    grunt.config.set("coffee", {
        dev: {
            options: {
                bare: true,
                sourceMap: true,
                sourceRoot: "./"
            },
            files: [
                {
                    expand: true,
                    cwd: "assets/js/",
                    src: ["**/*.coffee"],
                    dest: ".tmp/public/js/",
                    ext: ".js"
                }
            ]
        }
    });

    grunt.loadNpmTasks("grunt-contrib-coffee");
};
