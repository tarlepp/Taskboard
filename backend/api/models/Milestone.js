'use strict';

var _ = require('lodash');

/**
 * Milestone.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Milestone title
        title: {
            type:       'string',
            required:   true,
            minLength:  4
        },
        // Milestone description
        description: {
            type:       'text',
            defaultsTo: ''
        },
        // Possible milestone deadline date
        deadline: {
            type:       'date'
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      'Project',
            columnName: 'projectId',
            required:   true
        },
        // Story objects that are related to milestone
        stories: {
            collection: 'Story',
            via:        'milestone'
        },

        // Dynamic data attributes

        // Deadline date as moment object
        deadlineObject: function() {
            return (this.deadline && this.deadline != '0000-00-00')
                ? sails.services['date'].convertDateObjectToUtc(this.deadline) : null;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.milestone} values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.milestone} values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.milestone} values  Values to update
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
     * @param   {sails.model.milestone} values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.milestone} record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        sails.services['history'].write('Milestone', record, 'Added new milestone', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.milestone} record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        sails.services['history'].write('Milestone', record, 'Updated milestone data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.milestone[]}   records Destroyed records
     * @param   {Function}                  next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                sails.services['history'].write('Milestone', record, 'Removed milestone', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
