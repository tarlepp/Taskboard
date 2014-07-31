'use strict';

/**
 * RequestLog.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = {
    schema: true,
    migrate: 'alter',

    attributes: {
        // Request method
        method: {
            type:       'string',
            required:   true
        },
        // Request URL
        url: {
            type:       'string',
            required:   true
        },
        // Request headers
        headers: {
            type:       'json'
        },
        // Used parameters
        parameters: {
            type:       'json'
        },
        // Request query
        query: {
            type:       'json'
        },
        // Request body
        body: {
            type:       'json'
        },
        // Request protocol
        protocol: {
            type:       'string'
        },
        // Request IP address
        ip: {
            type:       'string'
        },

        // Below is all specification for relations to another models

        // User object
        user: {
            model:      'User',
            columnName: 'userId',
            required:   true
        },

        // Dynamic model data attributes

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
