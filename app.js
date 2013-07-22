// Start sails and pass it command line arguments
require('./assets/linker/vendor/date.format.js');

require('sails').lift(require('optimist').argv);
