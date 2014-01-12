/**
 * Project
 *
 * @module      ::  Model
 * @description ::  This model represents project on taskboard.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

module.exports = {
    schema: true,
    attributes: {
        // Relation to User model
        managerId: {
            type:       "integer",
            required:   true
        },
        title: {
            type:       "string",
            required:   true,
            minLength:  5
        },
        description: {
            type:       "text",
            required:   true,
            defaultsTo: ""
        },
        dateStart: {
            type:       "date",
            required:   true
        },
        dateEnd: {
            type:       "date",
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
        dateStartObject: function() {
            return (this.dateStart && this.dateStart != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.dateStart) : null;
        },
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.dateEnd) : null;
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
     * @param   {sails.model.project}   values
     * @param   {Function}              cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write("Project", values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.project}   values
     * @param   {Function}              cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write("Project", values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Project
            .findOne(terms)
            .done(function(error, project) {
                if (error) {
                    sails.log.error(error);
                } else {
                    HistoryService.remove("Project", project.id);
                }

                cb();
            });
    }
};
