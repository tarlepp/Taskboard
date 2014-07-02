'use strict';

var _ = require('lodash');

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
            return DateService.convertDateObjectToUtc(this.day);
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
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.excludeSprintDay}  record  Updated record
     * @param   {Function}                      next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.excludeSprintDay[]}    records Destroyed records
     * @param   {Function}                          next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});
