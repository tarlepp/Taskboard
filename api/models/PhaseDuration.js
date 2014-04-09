/**
 * PhaseDuration
 *
 * @module      ::  Model
 * @description ::  Model to keep track of phase duration times. Model contains information
 *                  that is easy access from any point of view (project, sprint, story, task)
 *                  so statistics is easy to use also.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

var async = require("async");
var moment = require("moment-timezone");

module.exports = {
    schema: true,
    attributes: {
        // Relation to Project model
        projectId: {
            type:       "integer"
        },
        // Relation to Sprint model
        sprintId: {
            type:       "integer"
        },
        // Relation to Story model
        storyId: {
            type:       "integer"
        },
        // Relation to Task model
        taskId: {
            type:       "integer",
            required:   true
        },
        // Relation to Phase model
        phaseId: {
            type:       "integer",
            required:   true
        },
        // Phase start datetime
        timeStart: {
            type:       "datetime"
        },
        // Phase end datetime
        timeEnd: {
            type:       "datetime"
        },
        // Absolute duration in seconds
        duration: {
            type:       "integer"
        },
        // Relative duration in seconds (no weekends, etc.)
        durationRelative: {
            type:       "integer"
        },
        // Is task duration still open, eg. it has only timeStart value
        open: {
            type:       "boolean",
            defaultsTo: true
        },

        // Dynamic data attributes

        timeStartObject: function() {
            return (this.timeStart && this.timeStart != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        timeEndObject: function() {
            return (this.timeEnd && this.timeEnd != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;
        },
        timeDurationHuman: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeStartObject().from(this.timeEndObject(), true);
            } else {
                output = "";
            }

            return output;
        },
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    },

    // Life cycle callbacks

    /**
     * Before create life cycle callback method. In this we will determine all
     * needed relation data for task phase duration row.
     *
     * @param   {{}}        values
     * @param   {Function}  next
     */
    beforeCreate: function(values, next) {
        async.waterfall(
            [
                /**
                 * Fetch task data.
                 *
                 * @param   {Function}  callback
                 */
                function(callback) {
                    DataService.getTask(values.taskId, function(error, task) {
                        callback(error, task);
                    });
                },

                /**
                 * Fetch story data.
                 *
                 * @param   {sails.model.task}  task
                 * @param   {Function}          callback
                 */
                function(task, callback) {
                    DataService.getStory(task.storyId, function(error, story) {
                        callback(error, task, story);
                    });
                },

                /**
                 * Fetch sprint data.
                 *
                 * @param   {sails.model.task}  task
                 * @param   {sails.model.story} story
                 * @param   {Function}          callback
                 */
                function(task, story, callback) {
                    DataService.getSprint(story.sprintId, function(error, sprint) {
                        callback(error, task, story, sprint);
                    });
                }
            ],

            /**
             * Main callback function which is called after last waterfall job is finished.
             *
             * @param   {null|Error}            error
             * @param   {sails.model.task}      task
             * @param   {sails.model.story}     story
             * @param   {sails.model.sprint}    sprint
             */
            function(error, task, story, sprint) {
                if (error) {
                    sails.log.error(__filename + ":" + __line + " [Relation data fetch failed, see log above.]");
                    sails.log.error(error);
                } else {
                    // Add relation information to current values
                    values.projectId = sprint.projectId;
                    values.sprintId = sprint.id;
                    values.storyId = story.id;
                    values.phaseId = task.phaseId;
                }

                next(error);
            }
        )
    },

    /**
     * Before update lifecycle callback. This will calculate relative duration for
     * current row.
     *
     * @todo implement this later
     *
     * @param   {sails.model.phaseDuration} values
     * @param   {Function}                  next
     */
    beforeUpdate: function(values, next) {
        next();
    }
};
