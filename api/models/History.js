/**
* History.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
'use strict';

module.exports = {
    schema: true,
    migrate: 'safe',

    attributes: {
        objectName: { // Reference to object, eg. Project, Milestone, Sprint, Story, etc.
            type:       'string',
            required:   true
        },
        objectId: { // Reference to object id.
            type:       'integer',
            required:   true
        },
        objectData: { // Object data which was saved, optionally with message
            type:       'text'
        },
        message: { // History message, optionally with objectData
            type:       'text'
        },
        user: { // Relation to user object
            model:      'User',
            columnName: 'userId',
            required:   false
        },

        // Dynamic data attributes

        createdAtObject: function() {
            return (this.createdAt && this.createdAt != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function() {
            return (this.updatedAt && this.updatedAt != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    }
};
