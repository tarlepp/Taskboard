/**
 * Sprint
 *
 * @module      ::  Model
 * @description ::  This model represents project sprint.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

module.exports = {
    schema: true,
    attributes: {
        // Relation to Project model
        projectId: {
            type:       "integer",
            required:   true
        },
        title: {
            type:       "string",
            required:   true
        },
        description: {
            type:       "text",
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
        durationDays: function() {
            return this.dateEndObject().diff(this.dateStartObject(), "days") + 1;
        },
        dateStartObject: function() {
            return (this.dateStart && this.dateStart != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.dateStart, true) : null;
        },
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != "0000-00-00")
                ? DateService.convertDateObjectToUtc(this.dateEnd, true) : null;
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
     * @param   {sails.model.sprint}    values
     * @param   {Function}              cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write("Sprint", values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.sprint}    values
     * @param   {Function}              cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write("Sprint", values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        // Remove history data
        Sprint
            .findOne(terms)
            .exec(function(error, sprint) {
                if (error) {
                    sails.log.error(error);

                    cb();
                } else {
                    HistoryService.remove("Sprint", sprint.id);

                    // Update all stories sprint id to 0 which belongs to delete sprint
                    Story
                        .update(
                            {sprintId: sprint.id},
                            {sprintId: 0},
                            function(error, stories) {
                                if (error) {
                                    sails.log.error(error);
                                }

                                cb();
                            }
                        );
                }
            });
    }
};
