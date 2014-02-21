module.exports = function(grunt) {

	grunt.config.set('cssmin', {
		dist: {
			src: ['.tmp/public/concat/production.css'],
			dest: '.tmp/public/min/production.css'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-cssmin');
};
