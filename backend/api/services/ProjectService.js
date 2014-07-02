'use strict';

var async = require('async');

/**
 * Generic ProjectService collection of methods that are attached to project related data.
 * Currently this service contains following methods:
 *
 *  addDefaultProjectManager(project, next)
 *  addDefaultPhases(project, next)
 *  addDefaultTaskTypes(project, next)
 */

/**
 * Service method to add default project manager to specified project. Note that
 * this method is called automatic from Project 'afterCreate' lifecycle callback.
 *
 * Purpose of this is add project created user to be in 'Manager' role on it also.
 *
 * @param   {sails.model.project}   project
 * @param   {function}              next
 */
exports.addDefaultProjectManager = function(project, next) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.ProjectService.addDefaultProjectManager() called]');

    // Attach created user to project as in 'Manager' role
    ProjectUser
        .create({
            role:           2,
            project:        project.id,
            user:           project.createdUser,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        })
        .exec(function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to add default project manager to project]');
                sails.log.error(error);
            }

            next(error);
        });
};

/**
 * Service method to add default project phase data to newly created project. Purpose
 * of this is just to help users to get started with new projects easily.
 *
 * Note that this method is called automatic from Project model 'afterCreate' lifecycle
 * callback method.
 *
 * @param   {sails.model.project}   project
 * @param   {function}              next
 */
exports.addDefaultPhases = function(project, next) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.ProjectService.addDefaultPhases() called]');

    // Specify default phases
    var defaultPhases = [
        {
            title:          'Tasks', 
            backgroundColor:'#c6d9f0', 
            order:          1, 
            taskCount:      0, 
            isDone:         false, 
            project:        project.id, 
            createdUser:    project.createdUser, 
            updatedUser:    project.createdUser
        },
        {
            title:          'In process',
            backgroundColor:'#92cddc',
            order:          2,
            taskCount:      3,
            isDone:         false,
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        },
        {
            title:          'To review',
            backgroundColor:'#8db3e2',
            order:          3,
            taskCount:      3,
            isDone:         false,
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        },
        {
            title:          'Reviewed',
            backgroundColor:'#548dd4',
            order:          4,
            taskCount:      6,
            isDone:         false,
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        },
        {
            title:          'Done',
            backgroundColor:'#0070c0',
            order:          5,
            taskCount:      0,
            isDone:         true,
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        }
    ];

    // Create specified phases
    async.each(
        defaultPhases,

        /**
         * Iterator function which will create specified phase.
         *
         * @param   {sails.model.phase} phase
         * @param   {function}          callback
         */
        function(phase, callback) {
            Phase
                .create(phase)
                .exec(function(error) {
                    callback(error);
                });
        },

        /**
         * Main callback function which is called after all specified phases are iterated.
         *
         * @param   {null|Error}    error   Possible error
         */
        function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to add default phases to project]');
                sails.log.error(error);
            }

            next(error);
        }
    );
};

/**
 * Service method to add default project task type data to newly created project. Purpose
 * of this is just to help users to get started with new projects easily.
 *
 * Note that this method is called automatic from Project model 'afterCreate' lifecycle
 * callback method.
 *
 * @param   {sails.model.project}   project
 * @param   {function}              next
 */
exports.addDefaultTaskTypes = function(project, next) {
    sails.log.verbose(__filename + ':' + __line + ' [Service.ProjectService.addDefaultTaskTypes() called]');

    // Specify 'default' task type data
    var defaultTaskTypes = [
        {
            title:          'Task',
            order:          1,
            colorChart:     '#548dd4',
            colorContainer: '#fcf8e3',
            colorBorder:    '#faebcc',
            colorText:      '#8a6d3b',
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        },
        {
            title:          'Test',
            order:          2,
            colorChart:     '#8db3e2',
            colorContainer: '#dff0d8',
            colorBorder:    '#d6e9c6',
            colorText:      '#3c763d',
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        },
        {
            title:          'Bug',
            order:          2,
            colorChart:     '#92cddc',
            colorBorder:    '#ebccd1',
            colorContainer: '#f2dede',
            colorText:      '#a94442',
            project:        project.id,
            createdUser:    project.createdUser,
            updatedUser:    project.createdUser
        }
    ];

    // Create of default task types for project
    async.each(
        defaultTaskTypes,

        /**
         * Iterator function to create default task types to
         * newly created project.
         *
         * @param   {sails.model.taskType}  taskType
         * @param   {function}              callback
         */
        function(taskType, callback) {
            TaskType
                .create(taskType)
                .exec(function(error) {
                    callback(error);
                });
        },

        /**
         * Main callback function which is called after async has mapped
         * all defaultTaskTypes and created those, or an error occurred
         * on creation.
         *
         * @param   {null|Error}    error   Possible error
         */
        function(error) {
            if (error) {
                sails.log.error(__filename + ':' + __line + ' [Failed to add default task types to project]');
                sails.log.error(error);
            }

            next(error);
        }
    );
};
