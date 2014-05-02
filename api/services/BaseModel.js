/**
 * baseModel
 *
 * @module      ::  Model
 * @description ::  This is a base model for all models to use. Purpose of this is to provide
 *                  some common attributes (static / dynamic) for all models that application
 *                  uses. Usage in actual models:
 *
 *                  var _ = require("lodash");
 *
 *                  module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
 *                      attributes: {
 *                          ...
 *                      }
 *                  });
 *
 * @docs        ::  http://sailsjs.org/#!documentation/models
 *                  https://groups.google.com/forum/#!topic/sailsjs/GTGoOGHAEvE
 */
"use strict";

module.exports = {
    schema: true,

    attributes: {
        // Relation to User object via created user id
        createdUser: {
            model:      "User",
            columnName: "createdUserId",
            required:   true
        },
        // Relation to User object via updated user id
        updatedUser: {
            model:      "User",
            columnName: "updatedUserId",
            required:   true
        },

        // Dynamic model data attributes

        // Object title normalization
        objectTitle: function() {
            var output = null;

            if (this.title) {
                output = this.title;
            } else if (this.lastName) { // Small hack for User model
                output = this.lastName + " " + this.firstName;
            }

            return output;
        },

        // Created timestamp as moment object
        createdAtObject: function() {
            return (this.createdAt && this.createdAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },

        // Updated timestamp as moment object
        updatedAtObject: function() {
            return (this.updatedAt && this.updatedAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    }
};
