module.exports = function(grunt) {

	grunt.config.set('uglify', {
		dist: {
			src: ['.tmp/public/concat/production.js'],
			dest: '.tmp/public/min/production.js'
		}
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
};
