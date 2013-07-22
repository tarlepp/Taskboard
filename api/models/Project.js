/**
 * Project
 *
 * @module      ::  Model
 * @description ::  This model represents project on taskboard.
 */
module.exports = {
    attributes: {
        managerId: { // This is relation to user model
            type:       'integer',
            required:   true
        },
        title: {
            type:       'string',
            required:   true
        },
        description: {
            type:       'text',
            required:   true
        },
        dateStart: {
            type:       'date',
            required:   true
        },
        dateEnd: {
            type:       'date',
            required:   true
        },

        dateStartObject: function() {
            return new Date(this.dateStart);
        },
        dateEndObject: function() {
            return new Date(this.dateEnd);
        },
        dateStartFormatted: function() {
            return this.dateStartObject().format('yyyy-mm-dd');
        },
        dateEndFormatted: function() {
            return this.dateEndObject().format('yyyy-mm-dd');
        }
    }
};
