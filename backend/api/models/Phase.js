'use strict';

var _ = require('lodash');

/**
 * Phase.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Phase title
        title: {
            type:       'string',
            required:   true,
            minLength:  2
        },
        // Description of the phase
        description: {
            type:       'text',
            defaultsTo: ''
        },
        // Background color which is used
        backgroundColor: {
            type:       'string',
            defaultsTo: '#428bca'
        },
        // Phase order
        order: {
            type:       'integer',
            defaultsTo: 0
        },
        // How many 'tasks' is allowed to in this phase
        taskCount: {
            type:       'integer',
            defaultsTo: 0
        },
        // If false, then in case of story splitting move phase tasks to new story
        isDone: {
            type:       'boolean',
            defaultsTo: false
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      'Project',
            columnName: 'projectId',
            required:   true
        },
        // Collection of Task objects that are attached to Phase
        tasks: {
            collection: 'Task',
            via: 'phase'
        },
        // PhaseDuration object that are related to Phase
        phaseDurations: {
            collection: 'PhaseDuration',
            via:        'phase'
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.phase}     values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidation: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.phase}     values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.phase}     values  Values to update
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
     * @param   {sails.model.phase}     values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidation: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.phase}     record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.phase}     record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.phase[]}   records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});

