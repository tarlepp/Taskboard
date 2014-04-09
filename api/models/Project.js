/**
 * Project
 *
 * @module      ::  Model
 * @description ::  This model represents project on taskboard.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Relation to User model
        managerId: {
            type:       "integer",
            required:   true
        },
        // Project title
        title: {
            type:       "string",
            required:   true,
            minLength:  4
        },
        // Description of the project
        description: {
            type:       "text",
            required:   true,
            defaultsTo: ""
        },
        // Project start date
        dateStart: {
            type:       "date",
            required:   true
        },
        // Project end date
        dateEnd: {
            type:       "date",
            required:   true
        },
        // Ignore weekends on this project, affects to burndown chart and phase duration calculations
        ignoreWeekends: {
            type:       "boolean",
            defaultsTo: false
        },

        // Dynamic data attributes

        dateStartObject: function() {
            return (this.dateStart && this.dateStart != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.dateStart) : null;
        },
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.dateEnd) : null;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.project}   values
     * @param   {Function}              next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Project", values);

        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.project}   values
     * @param   {Function}              next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Project", values);

        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        DataService.getProject(terms, function(error, project) {
            if (!error) {
                HistoryService.remove("Project", project.id);
            }

            next(error);
        });
    }
});
