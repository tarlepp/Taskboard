/**
 * History
 *
 * @module      ::  Model
 * @description ::  A short summary of how this model works and what it represents.
 *
 */

module.exports = {
    schema: true,
    attributes: {
        objectName: {
            type:       'string',
            required:   true
        },
        objectId: {
            type:       'integer',
            required:   true
        },
        objectData: {
            type:       'text',
            required:   true
        }
    },

    createdAtObject: function() {
        return (this.createdAt && this.createdAt != '0000-00-00') ? new Date(this.createdAt) : null;
    },
    createdAtFormatted: function() {
        return (this.createdAt && this.createdAt != '0000-00-00') ?  this.createdAtObject().format('isoDate') : '';
    }
};
