/**
 * Module dependencies
 */
var sails = require("sails");
var lifted = false;

global.sails = sails;
global.lifted = lifted;

module.exports = {
    build: function(cb) {
        if (lifted === false) {
            sails.lift(function() {
                setTimeout(cb('', sails), 2000);
            });
        } else {
            cb('', sails);
        }

    },

    teardown: function(sails, cb) {
        if (lifted) {
            sails.lower(function() {
                lifted = false;

                cb();
            });
        } else {
            cb();
        }
    }
};
