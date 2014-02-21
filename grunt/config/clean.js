module.exports = function(grunt) {

	grunt.config.set('clean', {
		dev: ['.tmp/public/**'],
		build: ['www']
	});

	grunt.loadNpmTasks('grunt-contrib-clean');
};
