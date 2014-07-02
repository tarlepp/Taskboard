'use strict';

var _ = require('lodash');

/**
 * TaskType.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Title of type
        title: {
            type:       'string',
            required:   true
        },
        // Description of the type
        description: {
            type:       'text',
            defaultsTo: ''
        },
        // Order of type
        order: {
            type:       'integer',
            required:   true
        },
        // Type color in charts
        colorChart: {
            type:       'string',
            required:   true
        },
        // Type color task container in board
        colorTaskContainer: {
            type:       'string',
            required:   true
        },
        // Type text color task container in board
        colorTaskText: {
            type:       'string',
            required:   true
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      'Project',
            columnName: 'projectId',
            required:   true
        },
        // Collection of Tasks that are attached to TaskType
        tasks: {
            collection: 'Task',
            via: 'taskType'
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.taskType}  values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.taskType}  values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.taskType}  values  Values to update
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
     * @param   {sails.model.taskType}  values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.taskType}  record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.taskType}  record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.taskType[]}    records Destroyed records
     * @param   {Function}                  next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});
