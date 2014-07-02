'use strict';

var _ = require('lodash');
var async = require('async');

/**
* /api/models/Project.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Project title
        title: {
            type:       'string',
            required:   true,
            minLength:  4
        },
        // Description of the project
        description: {
            type:       'text',
            required:   true,
            defaultsTo: ''
        },
        // Project start date
        dateStart: {
            type:       'date',
            required:   true
        },
        // Project end date
        dateEnd: {
            type:       'date',
            required:   true
        },
        // Ignore weekends on this project, affects to burndown chart and phase duration calculations
        ignoreWeekends: {
            type:       'boolean',
            defaultsTo: false
        },

        // Below is all specification for relations to another models

        // ProjectUser objects that are related to project
        projectUsers: {
            collection: 'ProjectUser',
            via:        'project'
        },
        // Phase objects that are related to project
        phases: {
            collection: 'Phase',
            via:        'project'
        },
        // Task type objects that are related to project
        taskTypes: {
            collection: 'TaskType',
            via:        'project'
        },
        // Sprint objects that are related to project
        sprints: {
            collection: 'Sprint',
            via:        'project'
        },
        // Story objects that are related to project
        stories: {
            collection: 'Story',
            via:        'project'
        },
        // Milestone objects that are related to project
        milestones: {
            collection: 'Milestone',
            via:        'project'
        },
        // Epic objects that are related to project
        epics: {
            collection: 'Epic',
            via:        'project'
        },
        // ExternalLink objects that are related to project
        externalLinks: {
            collection: 'ExternalLink',
            via:        'project'
        },
        // PhaseDuration object that are related to project
        phaseDurations: {
            collection: 'PhaseDuration',
            via:        'project'
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
                ? DateService.convertDateObjectToUtc(this.dateStart) : null;
        },
        // Date end as moment object.
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.dateEnd) : null;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.project}   values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.project}   values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.project}   values  Values to update
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
     * @param   {sails.model.project}   values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback. This will create necessary project specified relation
     * data so that users have a mock project at their hand after creation. Basically
     * We will create following project related data automatic:
     *
     *  1)  Attach create user as in 'Manager' role to project
     *  2)  Create default project phases
     *  3)  Create default project task types
     *
     * After creation of those, user can start work with created project right a way.
     *
     * @param   {sails.model.project}   record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        async.parallel(
            {
                users: function(callback) {
                    ProjectService.addDefaultProjectManager(record, callback);
                },
                phases: function(callback) {
                    ProjectService.addDefaultPhases(record, callback);
                },
                taskTypes: function(callback) {
                    ProjectService.addDefaultTaskTypes(record, callback);
                }
            },
            function(error) {
                next(error);
            }
        );
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.project}   record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.project[]} records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});
