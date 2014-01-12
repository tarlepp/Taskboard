/**
 * Type
 *
 * @module      ::  Model
 * @description ::  This model represent task types on taskboard. Basically this types are "static":
 *                   - 1 = normal
 *                   - 2 = bug
 *                   - 3 = test
 *                  Todo: make types to be project specified.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

module.exports = {
    schema: true,
    attributes: {
        title: {
            type:       "string",
            required:   true
        },
        order: {
            type:       "integer",
            required:   true
        },
        chartColor: {
            type:       "string",
            required:   true
        },
        class: {
            type:       "string",
            required:   true
        },
        classText: {
            type:       "string",
            required:   true
        },
        createdUserId: {
            type:       "integer",
            required:   true
        },
        updatedUserId: {
            type:       "integer",
            required:   true
        },

        // Dynamic data attributes

        objectTitle: function() {
            return this.title;
        },
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.type}  values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write("Type", values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.type}  values
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write("Type", values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Type
            .findOne(terms)
            .exec(function(error, type) {
                if (error) {
                    sails.log.error(error);
                } else {
                    HistoryService.remove("Type", type.id);
                }

                cb();
            });
    }
};
