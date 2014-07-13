'use strict';

/**
 * UserLogin.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = {
    attributes: {
        // User IP-address
        ip: {
            type:       'string',
            required:   true
        },
        // User hostname
        host: {
            type:       'string',
            required:   true
        },
        // User browser user-agent
        agent: {
            type:       'text',
            required:   true
        },
        // User browser
        browser: {
            type:       'string',
            defaultsTo: 'Unknown'
        },
        // User browser version
        browserVersion: {
            type:       'string',
            defaultsTo: 'Unknown'
        },
        // User browser family
        browserFamily: {
            type:       'string',
            defaultsTo: 'Unknown'
        },
        // User operation system
        os: {
            type:       'string',
            defaultsTo: 'Unknown'
        },
        // User operation system version
        osVersion: {
            type:       'string',
            defaultsTo: 'Unknown'
        },
        // User operation system family
        osFamily: {
            type:       'string',
            defaultsTo: 'Unknown'
        },
        count: {
            type:       'integer',
            defaultsTo: 1
        },

        // Below is all specification for relations to another models

        // Attached User object of this UserLogin
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
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.userLogin} values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.userLogin} values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.userLogin} values  Values to update
     * @param   {Function}              next    Callback function
     */
    beforeUpdate: function(values, next) {
        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        criteria    Delete criteria
     * @param   {Function}  next        Callback function
     */
    beforeDestroy: function(criteria, next) {
        next();
    },

    /**
     * After validation callback.
     *
     * @param   {sails.model.userLogin} values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.userLogin} record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.userLogin} record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.userLogin[]}   records Destroyed records
     * @param   {Function}                  next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
};
