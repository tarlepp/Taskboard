var injectedFiles = require('../values/injectedFiles');

module.exports = function(grunt) {

	grunt.config.set('concat', {
		js: {
			src: injectedFiles.jsFilesToInject,
			dest: '.tmp/public/concat/production.js'
		},
		css: {
			src: injectedFiles.cssFilesToInject,
			dest: '.tmp/public/concat/production.css'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
};
