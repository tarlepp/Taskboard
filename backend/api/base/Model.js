'use strict';

/**
 * api/base/model.js
 *
 * Base model for all sails.js models. This just contains some common code that every model uses
 */
module.exports = {
    schema: true,
    migrate: 'alter',

    attributes: {
        // Relation to User object via created user id
        createdUser: {
            model:      'User',
            columnName: 'createdUserId',
            required:   true
        },
        // Relation to User object via updated user id
        updatedUser: {
            model:      'User',
            columnName: 'updatedUserId',
            required:   true
        },

        // Dynamic model data attributes

        // Object title normalization
        objectTitle: function() {
            var output = null;

            if (this.title) {
                output = this.title;
            } else if (this.lastName) { // Small hack for User model
                output = this.lastName + ' ' + this.firstName;
            } else if (this.filename) { // And another hack for File model
                output = this.filename;
            }

            // todo comment model?

            return output;
        },
        // Created timestamp as moment object
        createdAtObject: function() {
            return (this.createdAt && this.createdAt != '0000-00-00 00:00:00')
                ? sails.services['date'].convertDateObjectToUtc(this.createdAt) : null;
        },
        // Updated timestamp as moment object
        updatedAtObject: function() {
            return (this.updatedAt && this.updatedAt != '0000-00-00 00:00:00')
                ? sails.services['date'].convertDateObjectToUtc(this.updatedAt) : null;
        }
    }
};
