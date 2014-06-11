'use strict';

/**
 * User.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
var _ = require('lodash');

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

        // Below is all specification for relations to another models

        // Passport configurations
        passports: {
            collection: 'Passport',
            via: 'user'
        },

        // Projects where manager
        projectManager: {
            collection: 'Project',
            via: 'manager'
        },

        // Created Projects
        createdProjects: {
            collection: 'Project',
            via: 'createdUser'
        },

        // Updated Projects (latest update)
        updatedProjects: {
            collection: 'Project',
            via: 'updatedUser'
        },

        // Created Sprints
        createdSprints: {
            collection: 'Sprint',
            via: 'createdUser'
        },

        // Updated Sprints (latest update)
        updatedSprints: {
            collection: 'Sprint',
            via: 'updatedUser'
        },

        // Created Users
        createdUsers: {
            collection: 'User',
            via: 'createdUser'
        },

        // Updated Users (latest update)
        updatedUsers: {
            collection: 'User',
            via: 'updatedUser'
        },

        // Dynamic data attributes

        // Computed user fullName string
        fullName: function() {
            return this.lastName + ' ' + this.firstName;
        }
    }
});
