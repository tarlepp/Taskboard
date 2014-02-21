var injectedFiles = require('../values/injectedFiles');

module.exports = function(grunt) {

	var templateFilesToInject = [
		'templates/**/*.html'
	];

	grunt.config.set('jst', {
		dev: {

			// To use other sorts of templates, specify the regexp below:
			// options: {
			//   templateSettings: {
			//     interpolate: /\{\{(.+?)\}\}/g
			//   }
			// },

			files: {
				'.tmp/public/jst.js': injectedFiles.templateFilesToInject
			}
		}
	});

	grunt.loadNpmTasks('grunt-contrib-jst');
};
