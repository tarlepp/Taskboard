'use strict';

/**
* /api/models/Project.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var _ = require('lodash');

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

        // Relation to User model
        manager: {
            model:      'User',
            columnName: 'managerId'
        },

        // Sprint objects that are related to project
        sprints: {
            collection: 'Sprint',
            via: 'project'
        },

        // Dynamic data attributes

        dateStartObject: function() {
            return (this.dateStart && this.dateStart != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.dateStart) : null;
        },
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.dateEnd) : null;
        }

    }
});
