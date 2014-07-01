'use strict';

var _ = require('lodash');

/**
 * ExcludeSprintDay.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Day that is excluded
        day: {
            type:       'date',
            required:   true
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        sprint: {
            model:      'Sprint',
            columnName: 'sprintId',
            required:   true
        },

        // Dynamic model data attributes

        // Exclude day as moment object
        dayObject: function() {
            return DateService.convertDateObjectToUtc(this.day);
        }
    }
});
