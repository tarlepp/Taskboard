/**
 * Type
 *
 * @module      ::  Model
 * @description ::  This model represent task types on taskboard. Basically this types are "static":
 *                   - 1 = normal
 *                   - 2 = bug
 *                   - 3 = test
 * @todo        ::  1) Make types to be project specified.
 *                  2) Remove class and classText attributes and replace those by color definitions.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
    attributes: {
        // Title of type
        title: {
            type:       "string",
            required:   true
        },
        // Order of type
        order: {
            type:       "integer",
            required:   true
        },
        // Type color in charts
        chartColor: {
            type:       "string",
            required:   true
        },
        // CSS class of type
        class: {
            type:       "string",
            required:   true
        },
        // CSS class for type text
        classText: {
            type:       "string",
            required:   true
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.type}  values
     * @param   {Function}          next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Type", values);

        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.type}  values
     * @param   {Function}          next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Type", values);

        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        Type
            .findOne(terms)
            .exec(function(error, type) {
                if (error) {
                    sails.log.error(error);
                } else if (type) {
                    HistoryService.remove("Type", type.id);
                }

                next(error);
            });
    }
});
