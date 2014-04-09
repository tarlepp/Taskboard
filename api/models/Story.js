/**
 * Story
 *
 * @module      ::  Model
 * @description ::  This model represent user story on taskboard. User stories are attached to project and
 *                  sprint. Sprint relation is not required, if sprintId is 0 or null current user story is
 *                  in project backlog.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

var moment = require("moment-timezone");
var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Relation to Project model
        projectId: {
            type:       "integer",
            required:   true
        },
        // Relation to Sprint model
        sprintId: {
            type:       "integer",
            defaultsTo: 0
        },
        // Relation to Milestone model
        milestoneId: {
            type:       "integer",
            defaultsTo: 0
        },
        // Relation to type model, note that this is just default type for story tasks
        typeId: {
            type:       "integer",
            defaultsTo: 0,
            required:   true
        },
        // Relation to parent story, this tells where the story is splitted
        parentId: {
            type:       "integer",
            defaultsTo: 0,
            required:   true
        },
        // Story title
        title: {
            type:       "string",
            required:   true,
            minLength:  4
        },
        // Description of the story
        description: {
            type:       "text",
            required:   true,
            defaultsTo: ""
        },
        // Story estimate as in fibonacci number. -1 means ??? eg. no estimate
        estimate: {
            type:       "float",
            required:   true,
            defaultsTo: -1
        },
        // Story priority
        priority: {
            type:       "integer",
            defaultsTo: 0
        },
        // Is story done or not, this is updated automatic via Task model life cycle callbacks
        isDone: {
            type:       "boolean",
            required:   true,
            defaultsTo: false
        },
        // Ignore story in burndown chart
        ignoreInBurnDownChart: {
            type:       "boolean",
            required:   true,
            defaultsTo: false
        },
        /**
         * Story start time, this is set when first task is moved to another phase and
         * reset if all tasks are moved back to first phase.
         */
        timeStart: {
            type:       "datetime"
        },
        /**
         * Story stop time, this is set when all tasks are moved to "done" phase and
         * reset in other moves.
         */
        timeEnd: {
            type:       "datetime"
        },

        // Dynamic data attributes

        estimateFormatted: function() {
            return (parseInt(this.estimate, 10) === -1) ? "???" : this.estimate;
        },
        timeStartObject: function() {
            return (this.timeStart && this.timeStart != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        timeEndObject: function() {
            return (this.timeEnd && this.timeEnd != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;
        },
        timeDuration: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeEndObject().diff(this.timeStartObject(), "seconds");
            } else {
                output = 0;
            }

            return output;
        },
        timeDurationHuman: function() {
            var output;

            if (moment.isMoment(this.timeStartObject()) && moment.isMoment(this.timeEndObject())) {
                output = this.timeStartObject().from(this.timeEndObject(), true);
            } else {
                output = "";
            }

            return output;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.story} values
     * @param   {Function}          next
     */
    beforeValidation: function(values, next) {
        if (typeof values.ignoreInBurnDownChart !== "boolean") {
            values.ignoreInBurnDownChart = false;
        }

        next();
    },

    /**
     * Before create callback. Basically we want to make sure that isDone bit is set to false
     * and determine story priority according to same project and sprint stories.
     *
     * @param   {sails.model.story} values
     * @param   {Function}          next
     */
    beforeCreate: function(values, next) {
        values.isDone = false;

        Story
            .findOne({
                projectId: values.projectId,
                sprintId: values.sprintId
            })
            .sort("priority DESC")
            .exec(function(error, story) {
                if (error) {
                    sails.log.error(__filename + ":" + __line + " [Story fetch failed.]");
                    sails.log.error(error);
                } else if (!story) {
                    values.priority = 0;
                } else {
                    values.priority = story.priority + 1;
                }

                next(error);
            });
    },

    /**
     * After create callback
     *
     * @param   {sails.model.story} values
     * @param   {Function}          next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Story", values);

        next();
    },

    /**
     * After update callback
     *
     * @param   {sails.model.story} values
     * @param   {Function}          next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Story", values);

        next();
    },

    /**
     * Before destroy callback
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        DataService.getStory(terms, function(error, story) {
            if (!error) {
                HistoryService.remove("Story", story.id);
            }

            next(error);
        });
    }
});
