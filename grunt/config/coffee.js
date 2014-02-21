module.exports = function(grunt) {

	grunt.config.set('coffee', {
		dev: {
			options: {
				bare: true,
				sourceMap: true,
				sourceRoot: './'
			},
			files: [{
				expand: true,
				cwd: 'assets/js/',
				src: ['**/*.coffee'],
				dest: '.tmp/public/js/',
				ext: '.js'
			}, {
				expand: true,
				cwd: 'assets/js/',
				src: ['**/*.coffee'],
				dest: '.tmp/public/js/',
				ext: '.js'
			}]
		}
	});

	grunt.loadNpmTasks('grunt-contrib-coffee');
};
