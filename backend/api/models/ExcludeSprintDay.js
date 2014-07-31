'use strict';

var _ = require('lodash');
var async = require('async');

/**
 * ExcludeSprintDay.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Day that is excluded
        day: {
            type:       'date',
            required:   true
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        sprint: {
            model:      'Sprint',
            columnName: 'sprintId',
            required:   true
        },

        // Dynamic model data attributes

        // Exclude day as moment object
        dayObject: function() {
            return sails.services['date'].convertDateObjectToUtc(this.day);
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.excludeSprintDay}  values  Values to create / update
     * @param   {Function}                      next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.excludeSprintDay}  values  Values to create
     * @param   {Function}                      next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.excludeSprintDay}  values  Values to update
     * @param   {Function}                      next    Callback function
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
     * @param   {sails.model.excludeSprintDay}  values  Values to create / update
     * @param   {Function}                      next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.excludeSprintDay}  record  Newly inserted record
     * @param   {Function}                      next    Callback function
     */
    afterCreate: function(record, next) {
        sails.services['history'].write('ExcludeSprintDay', record, 'Added new exclude sprint day', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.excludeSprintDay}  record  Updated record
     * @param   {Function}                      next    Callback function
     */
    afterUpdate: function(record, next) {
        sails.services['history'].write('ExcludeSprintDay', record, 'Updated exclude sprint day data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.excludeSprintDay[]}    records Destroyed records
     * @param   {Function}                          next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                sails.services['history'].write('ExcludeSprintDay', record, 'Removed exclude sprint day', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
