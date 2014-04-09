/**
 * Milestone
 *
 * @module      ::  Model
 * @description ::  This model represents project milestone in taskboard. Note that all milestones are
 *                  connected to specified project.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Relation to Project model
        projectId: {
            type:       "integer",
            required:   true
        },
        // Milestone title
        title: {
            type:       "string",
            required:   true,
            minLength:  4
        },
        // Milestone description
        description: {
            type:       "text",
            defaultsTo: ""
        },
        // Possible milestone deadline date
        deadline: {
            type:       "date"
        },

        // Dynamic data attributes

        deadlineObject: function() {
            return (this.deadline && this.deadline != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.deadline) : null;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.milestone} values
     * @param   {Function}              next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Milestone", values);

        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.milestone} values
     * @param   {Function}              next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Milestone", values);

        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        DataService.getMilestone(terms, function(error, milestone) {
            if (!error) {
                HistoryService.remove("Milestone", milestone.id);
            }

            next(error);
        });
    }
});
