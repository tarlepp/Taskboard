'use strict';

var _ = require('lodash');
var async = require('async');
var moment = require('moment-timezone');

/**
 * Task.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Task title
        title: {
            type:       'string',
            required:   true,
            minLength:  4
        },
        // Description of the task
        description: {
            type:       'text',
            defaultsTo: ''
        },
        // Task priority on story
        priority: {
            type:       'integer',
            defaultsTo: 0
        },
        // Is task done, this is updated automatic within life cycle callbacks
        isDone: {
            type:       'boolean',
            required:   true,
            defaultsTo: false
        },
        // Task start time, this is updated automatic when task is moved from phase to another one
        timeStart: {
            type:       'datetime'
        },
        // Task end time, this is updated automatic when task is moved to 'done' phase
        timeEnd: {
            type:       'datetime'
        },

        // Below is all specification for relations to another models

        // Relation to Story model
        story: {
            model:      'Story',
            columnName: 'storyId',
            required:   true
        },
        // Relation to Phase model
        phase: {
            model:      'Phase',
            columnName: 'phaseId',
            defaultsTo: 0
        },
        // Relation to TaskType model
        taskType: {
            model:      'TaskType',
            columnName: 'taskTypeId',
            defaultsTo: 0
        },
        // PhaseDuration object that are related to Task
        phaseDurations: {
            collection: 'PhaseDuration',
            via:        'task'
        },

        // Dynamic data attributes

        // Time start as a moment object
        timeStartObject: function() {
            return (this.timeStart && this.timeStart != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        // Time end as a moment object
        timeEndObject: function() {
            return (this.timeEnd && this.timeEnd != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;
        },
        // Current task duration as in seconds
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
        // Current task duration as human readable format
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
     * @param   {sails.model.task}      values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @todo; determine first phase and remove taskType
     *
     * @param   {sails.model.task}      values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        values.isDone = false;
        values.phase = 0;
        values.taskType = 0;

        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.task}      values  Values to update
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
     * @param   {sails.model.task}      values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.task}      record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        HistoryService.write('Task', record, 'Added new task', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.task}      record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        HistoryService.write('Task', record, 'Updated task data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.task[]}    records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                HistoryService.write('Task', record, 'Removed task', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
