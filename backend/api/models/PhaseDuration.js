'use strict';

/**
 * PhaseDuration.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = {
    schema: true,
    migrate: 'alter',
  
    attributes: {
        // Phase start datetime
        timeStart: {
            type:       'datetime'
        },
        // Phase end datetime
        timeEnd: {
            type:       'datetime'
        },
        // Absolute duration in seconds
        duration: {
            type:       'integer'
        },
        // Relative duration in seconds (no weekends, etc.)
        durationRelative: {
            type:       'integer'
        },
        // Is task duration still open, eg. it has only timeStart value
        open: {
            type:       'boolean',
            defaultsTo: true
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      'Project',
            columnName: 'projectId',
            required:   true
        },
        // Relation to Sprint model
        sprint: {
            model:      'Sprint',
            columnName: 'sprintId',
            required:   true
        },
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
            required:   true
        },
        // Relation to Task model
        task: {
            model:      'Task',
            columnName: 'taskId',
            required:   true
        },

        // Dynamic data attributes

        // Start time as moment object
        timeStartObject: function() {
            return (this.timeStart && this.timeStart != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.timeStart) : null;
        },
        // Start end as moment object
        timeEndObject: function() {
            return (this.timeEnd && this.timeEnd != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.timeEnd) : null;
        },
        // Current phase duration as in seconds
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
        // Current phase duration as human readable format
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
        },
        // Created timestamp as moment object
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        // Updated timestamp as moment object
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != '0000-00-00 00:00:00')
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.phaseDuration} values  Values to create / update
     * @param   {Function}                  next    Callback function
     */
    beforeValidation: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.phaseDuration} values  Values to create
     * @param   {Function}                  next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.phaseDuration} values  Values to update
     * @param   {Function}                  next    Callback function
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
     * @param   {sails.model.phaseDuration} values  Values to create / update
     * @param   {Function}                  next    Callback function
     */
    afterValidation: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.phaseDuration} record  Newly inserted record
     * @param   {Function}                  next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.phaseDuration} record  Updated record
     * @param   {Function}                  next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.phaseDuration[]}   records Destroyed records
     * @param   {Function}                      next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
};

