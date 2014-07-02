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
        // Object data which was saved
        objectData: {
            type:       'text'
        },
        // History message
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
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.history}   values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.history}   values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.history}   values  Values to update
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
     * @param   {sails.model.history}   values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.history}   record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.history}   record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.history[]} records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
};
