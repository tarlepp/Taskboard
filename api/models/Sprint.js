/**
* Sprint.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
"use strict";

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/BaseModel")), {
    attributes: {
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

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      "Project",
            columnName: "projectId"
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
    }
});


