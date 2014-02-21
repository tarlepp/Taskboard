module.exports = function(grunt) {

	grunt.config.set('less', {
		dev: {
			files: [{
				expand: true,
				cwd: 'assets/styles/',
				src: ['*.less'],
				dest: '.tmp/public/styles/',
				ext: '.css'
			}, {
				expand: true,
				cwd: 'assets/styles/',
				src: ['*.less'],
				dest: '.tmp/public/styles/',
				ext: '.css'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-less');
};
