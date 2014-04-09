/**
 * Phase
 *
 * @module      ::  Model
 * @description ::  This model represents project phases in taskboard. Note that all phases are
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
        // Phase title
        title: {
            type:       "string",
            required:   true,
            minLength:  2
        },
        // Description of the phase
        description: {
            type:       "text",
            defaultsTo: ""
        },
        // Background color which is used
        backgroundColor: {
            type:       "string",
            defaultsTo: "#428bca"
        },
        // Phase order
        order: {
            type:       "integer",
            defaultsTo: 0
        },
        // How many "tasks" is allowed to in this phase
        tasks: {
            type:       "integer",
            defaultsTo: 0
        },
        // If false, then in case of story splitting move phase tasks to new story
        isDone: {
            type:       "boolean",
            defaultsTo: false
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.phase}     values
     * @param   {Function}              next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Phase", values);

        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.phase}     values
     * @param   {Function}              next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Phase", values);

        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        Phase
            .findOne(terms)
            .exec(function(error, phase) {
                if (error) {
                    sails.log.error(error);
                } else if (phase) {
                    HistoryService.remove("Phase", phase.id);
                }

                next();
            });
    }
});
