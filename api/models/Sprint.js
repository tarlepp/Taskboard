/**
 * Sprint
 *
 * @module      ::  Model
 * @description ::  This model represents project sprint.
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
        // Sprint title
        title: {
            type:       "string",
            required:   true
        },
        // Description of the sprint
        description: {
            type:       "text",
            defaultsTo: ""
        },
        // Sprint start date
        dateStart: {
            type:       "date",
            required:   true
        },
        // Sprint end date
        dateEnd: {
            type:       "date",
            required:   true
        },
        // Ignore weekends on sprint, this will affect to burndown charts and phase duration calculations
        ignoreWeekends: {
            type:       "boolean",
            defaultsTo: false
        },

        // Dynamic data attributes

        // Note that this doesn't account possible sprint exclude days
        durationDays: function() {
            var output = 0;

            if (this.ignoreWeekends) {
                var _start = this.dateStartObject().clone();

                while (this.dateEndObject().diff(_start, "days") >= 0) {
                    var weekDay = _start.isoWeekday();

                    if (weekDay !== 6 && weekDay !== 7) {
                        output = output + 1;
                    }

                    _start.add("days", 1);
                }
            } else {
                output = this.dateEndObject().diff(this.dateStartObject(), "days") + 1;
            }

            return output;
        },
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
     * @param   {sails.model.sprint}    values
     * @param   {Function}              next
     */
    afterCreate: function(values, next) {
        HistoryService.write("Sprint", values);

        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.sprint}    values
     * @param   {Function}              next
     */
    afterUpdate: function(values, next) {
        HistoryService.write("Sprint", values);

        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        DataService.getSprint(terms, function(error, sprint) {
            if (!error) {
                HistoryService.remove("Sprint", sprint.id);

                // Update all stories sprint id to 0 which belongs to delete sprint
                Story
                    .update(
                    {sprintId: sprint.id},
                    {sprintId: 0},
                    function(error) {
                        if (error) {
                            sails.log.error(__filename + ":" + __line + " [Sprint story updates failed.]");
                            sails.log.error(error);
                        }

                        next(error);
                    }
                );
            } else {
                next(error);
            }
        });
    }
});
