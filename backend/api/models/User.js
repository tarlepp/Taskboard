'use strict';

var _ = require('lodash');
var async = require('async');

/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        username: {
            type:       'string',
            unique:     true
        },
        email: {
            type:       'email',
            unique:     true
        },
        firstName: {
            type:       'string',
            required:   true
        },
        lastName: {
            type:       'string',
            required:   true
        },
        admin: {
            type:       'boolean',
            defaultsTo: false
        },
        language: {
            type:       'string',
            defaultsTo: 'fi',
            required:   true
        },
        momentFormatDate: {
            type:       'string',
            defaultsTo: 'L',
            required:   true
        },
        momentFormatTime: {
            type:       'string',
            defaultsTo: 'LT',
            required:   true
        },
        momentFormatDateTime: {
            type:       'string',
            defaultsTo: 'L LT',
            required:   true
        },
        momentTimezone: {
            type:       'string',
            defaultsTo: 'Europe/Mariehamn',
            required:   true
        },

        // Below is all specification for relations to another models

        // Passport configurations
        passports: {
            collection: 'Passport',
            via:        'user'
        },
        histories: {
            collection: 'History',
            via:        'user'
        },
        logins: {
            collection: 'UserLogin',
            via:        'user'
        },
        // ProjectUser objects that are related to User
        projectUsers: {
            collection: 'ProjectUser',
            via:        'user'
        },
        // Created Users
        createdUsers: {
            collection: 'User',
            via:        'createdUser'
        },
        // Updated Users (latest update)
        updatedUsers: {
            collection: 'User',
            via:        'updatedUser'
        },
        // Created Projects
        createdProjects: {
            collection: 'Project',
            via:        'createdUser'
        },
        // Updated Projects (latest update)
        updatedProjects: {
            collection: 'Project',
            via:        'updatedUser'
        },
        // Created ProjectUsers
        createdProjectUsers: {
            collection: 'ProjectUser',
            via:        'createdUser'
        },
        // Updated Projects (latest update)
        updatedProjectUsers: {
            collection: 'ProjectUser',
            via:        'updatedUser'
        },
        // Created Phases
        createdPhases: {
            collection: 'Phase',
            via:        'createdUser'
        },
        // Updated Phases (latest update)
        updatedPhases: {
            collection: 'Phase',
            via:        'updatedUser'
        },
        // Created Sprints
        createdSprints: {
            collection: 'Sprint',
            via:        'createdUser'
        },
        // Updated Sprints (latest update)
        updatedSprints: {
            collection: 'Sprint',
            via:        'updatedUser'
        },
        // Created Stories
        createdStories: {
            collection: 'Story',
            via:        'createdUser'
        },
        // Updated Stories (latest update)
        updatedStories: {
            collection: 'Story',
            via:        'updatedUser'
        },
        // Created Milestones
        createdMilestones: {
            collection: 'Milestone',
            via:        'createdUser'
        },
        // Updated Milestones (latest update)
        updatedMilestones: {
            collection: 'Milestone',
            via:        'updatedUser'
        },
        // Created Epics
        createdEpics: {
            collection: 'Epic',
            via:        'createdUser'
        },
        // Updated Epics (latest update)
        updatedEpics: {
            collection: 'Epic',
            via:        'updatedUser'
        },
        // Created TaskTypes
        createdTaskTypes: {
            collection: 'TaskType',
            via:        'createdUser'
        },
        // Updated TaskTypes (latest update)
        updatedTaskTypes: {
            collection: 'TaskType',
            via:        'updatedUser'
        },
        // Created Tasks
        createdTasks: {
            collection: 'Task',
            via:        'createdUser'
        },
        // Updated Tasks (latest update)
        updatedTasks: {
            collection: 'Task',
            via:        'updatedUser'
        },
        // Created ExternalLinks
        createdExternalLinks: {
            collection: 'ExternalLink',
            via:        'createdUser'
        },
        // Updated ExternalLinks (latest update)
        updatedExternalLinks: {
            collection: 'ExternalLink',
            via:        'updatedUser'
        },
        // Created ExcludeSprintDays
        createdExcludeSprintDays: {
            collection: 'ExcludeSprintDay',
            via:        'createdUser'
        },
        // Updated ExcludeSprintDays (latest update)
        updatedExcludeSprintDays: {
            collection: 'ExcludeSprintDay',
            via:        'updatedUser'
        },
        // Created Comments
        createdComments: {
            collection: 'Comment',
            via:        'createdUser'
        },
        // Updated Comments (latest update)
        updatedComments: {
            collection: 'Comment',
            via:        'updatedUser'
        },
        // Created Files
        createdFiles: {
            collection: 'File',
            via:        'createdUser'
        },
        // Updated Files (latest update)
        updatedFiles: {
            collection: 'File',
            via:        'updatedUser'
        },
        // Created Links
        createdLinks: {
            collection: 'Link',
            via:        'createdUser'
        },
        // Updated Links (latest update)
        updatedLinks: {
            collection: 'Link',
            via:        'updatedUser'
        },

        // Dynamic data attributes

        // Computed user fullName string
        fullName: function() {
            return this.lastName + ' ' + this.firstName;
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.user}      values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.user}      values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.user}      values  Values to update
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
     * @param   {sails.model.user}      values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.user}      record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        HistoryService.write('User', record, 'Added new user', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.user}      record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        HistoryService.write('User', record, 'Updated user data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.user[]}    records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                HistoryService.write('User', record, 'Removed user', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
