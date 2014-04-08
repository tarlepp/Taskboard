/**
 * ExcludeSprintDay
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        sprintId: {
            type:       "integer",
            required:   true
        },
        day: {
            type:       "date",
            required:   true
        },

        // Dynamic model data attributes

        dayObject: function() {
            return DateService.convertDateObjectToUtc(this.day, true);
        }
    }
});
