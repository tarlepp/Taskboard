'use strict';

/**
 * History.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = {
    schema: true,
    migrate: 'alter',

    attributes: {
        // Reference to object, eg. Project, Milestone, Sprint, Story, Task, etc.
        objectName: {
            type:       'string',
            required:   true
        },
        // Reference to object id.
        objectId: {
            type:       'integer',
            required:   true
        },
        // Object data which was saved, optionally with message
        objectData: {
            type:       'text'
        },
        // History message, optionally with objectData
        message: {
            type:       'text'
        },

        // Below is all specification for relations to another models

        // Relation to user model, each history rows has one of this
        user: {
            model:      'User',
            columnName: 'userId',
            required:   true
        },

        // Dynamic model data attributes

        // Created timestamp as moment object
        createdAtObject: function() {
            return (this.createdAt && this.createdAt != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        // Updated timestamp as moment object
        updatedAtObject: function() {
            return (this.updatedAt && this.updatedAt != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    }
};
