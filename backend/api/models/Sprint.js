'use strict';

var _ = require('lodash');
var async = require('async');

/**
* Sprint.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Sprint title
        title: {
            type:       'string',
            required:   true,
            minLength:  4
        },
        // Description of the sprint
        description: {
            type:       'text',
            defaultsTo: ''
        },
        // Sprint start date
        dateStart: {
            type:       'date',
            required:   true
        },
        // Sprint end date
        dateEnd: {
            type:       'date',
            required:   true
        },
        // Ignore weekends on sprint, this will affect to burndown charts and phase duration calculations
        ignoreWeekends: {
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
        // Story objects that are related to sprint
        stories: {
            collection: 'Story',
            via:        'sprint'
        },
        // Story objects that are related to sprint
        excludeSprintDays: {
            collection: 'excludeSprintDay',
            via:        'sprint'
        },
        // PhaseDuration object that are related to sprint
        phaseDurations: {
            collection: 'PhaseDuration',
            via:        'sprint'
        },

        // Dynamic data attributes

        /**
         * Sprint duration as in days.
         *
         * Note that this doesn't account possible sprint exclude days
         */
        durationDays: function() {
            var output = 0;

            if (this.ignoreWeekends) {
                var _start = this.dateStartObject().clone();

                while (this.dateEndObject().diff(_start, 'days') >= 0) {
                    var weekDay = _start.isoWeekday();

                    if (weekDay !== 6 && weekDay !== 7) {
                        output = output + 1;
                    }

                    _start.add('days', 1);
                }
            } else {
                output = this.dateEndObject().diff(this.dateStartObject(), 'days') + 1;
            }

            return output;
        },
        // Date start as moment object.
        dateStartObject: function() {
            return (this.dateStart && this.dateStart != '0000-00-00')
                ? sails.services['date'].convertDateObjectToUtc(this.dateStart) : null;
        },
        // Date end as moment object.
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != '0000-00-00')
                ? sails.services['date'].convertDateObjectToUtc(this.dateEnd) : null;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.sprint}    values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.sprint}    values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.sprint}    values  Values to update
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
     * @param   {sails.model.sprint}    values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.sprint}    record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        sails.services['history'].write('Sprint', record, 'Added new sprint', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.sprint}    record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        sails.services['history'].write('Sprint', record, 'Updated sprint data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.sprint[]}  records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                sails.services['history'].write('Sprint', record, 'Removed sprint', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
