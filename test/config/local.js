/**
 * Configuration for Travis CI integration.
 */
module.exports.adapters = {
    // If you leave the adapter config unspecified
    // in a model definition, 'default' will be used.
    'default': 'mysql',

    // MySQL is the world's most popular relational database.
    // Learn more: http://en.wikipedia.org/wiki/MySQL
    mysql: {
        module: 'sails-mysql',
        host: 'localhost',
        user: 'travis',
        password: '',
        database: 'myapp_test'
    }
};