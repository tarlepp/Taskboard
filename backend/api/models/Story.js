'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment-timezone');

/**
 * Story.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Story title
        title: {
            type:       'string',
            required:   true,
            minLength:  4
        },
        // Description of the story
        description: {
            type:       'text',
            required:   true,
            defaultsTo: ''
        },
        // Story estimate as in fibonacci number. -1 means ??? eg. no estimate
        estimate: {
            type:       'float',
            required:   true,
            defaultsTo: -1
        },
        // Story priority
        priority: {
            type:       'integer',
            defaultsTo: 0
        },
        // Is story done or not, this is updated automatic via Task model life cycle callbacks
        isDone: {
            type:       'boolean',
            defaultsTo: false
        },
        // Ignore story in burndown chart
        ignoreInBurnDownChart: {
            type:       'boolean',
            defaultsTo: false
        },
        /**
         * Story start time, this is set when first task is moved to another phase and
         * reset if all tasks are moved back to first phase.
         */
        timeStart: {
            type:       'datetime'
        },
        /**
         * Story stop time, this is set when all tasks are moved to 'done' phase and
         * reset in other moves.
         */
        timeEnd: {
            type:       'datetime'
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      'Project',
            columnName: 'projectId',
            required:   true
        },
        // Relation to Sprint model, if not set story is in project backlog
        sprint: {
            model:      'Sprint',
            columnName: 'sprintId'
        },
        // Relation to Milestone model, this is not required
        milestone: {
            model:      'Milestone',
            columnName: 'milestoneId'
        },
        // Relation to Epic model, this is not required
        epic: {
            model:      'Epic',
            columnName: 'epicId'
        },
        // Collection of Tasks that are attached to story
        tasks: {
            collection: 'Task',
            via:        'story'
        },
        // PhaseDuration object that are related to story
        phaseDurations: {
            collection: 'PhaseDuration',
            via:        'story'
        },

        // Dynamic data attributes

        // Formatted estimate value
        estimateFormatted: function() {
            return (parseInt(this.estimate, 10) === -1) ? '???' : this.estimate;
        },
        // Time start as a moment object
        timeStartObject: function() {
            return (this.timeStart && this.timeStart != '0000-00-00 00:00:00')
                ? sails.services['date'].convertDateObjectToUtc(this.timeStart) : null;
        },
        // Time end as a moment object
        timeEndObject: function() {
            return (this.timeEnd && this.timeEnd != '0000-00-00 00:00:00')
                ? sails.services['date'].convertDateObjectToUtc(this.timeEnd) : null;
        },
        // Current story duration as in seconds
        timeDuration: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeEndObject().diff(this.timeStartObject(), 'seconds');
            } else if (moment.isMoment(this.timeStartObject())) {
                output = moment.utc().diff(this.timeStartObject(), 'seconds');
            } else {
                output = 0;
            }

            return output;
        },
        // Current story duration as human readable format
        timeDurationHuman: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeStartObject().from(this.timeEndObject(), true);
            } else if (moment.isMoment(this.timeStartObject())) {
                output = this.timeStartObject().from(moment.utc(), true);
            } else {
                output = '';
            }

            return output;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.story}     values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.story}     values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.story}     values  Values to update
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
     * @param   {sails.model.story}     values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.story}     record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        sails.services['history'].write('Story', record, 'Added new story', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.story}     record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        sails.services['history'].write('Story', record, 'Updated story data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.story[]}   records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                sails.services['history'].write('Story', record, 'Removed story', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
