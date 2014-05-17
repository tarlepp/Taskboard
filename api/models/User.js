/**
* User.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
"use strict";

var _ = require("lodash");
var bcrypt = require("bcrypt");
var gravatar = require("gravatar");

/**
 * Generic password hash function.
 *
 * @param   {sails.model.user}  values
 * @param   {Function}          next
 */
function hashPassword(values, next) {
    bcrypt.hash(values.password, 10, function(error, hash) {
        if (error) {
            sails.log.error(__filename + ":" + __line + " [Password hashing failed]");
            sails.log.error(error);

            return next(error);
        }

        values.password = hash;

        return next();
    });
}

module.exports = _.merge(_.cloneDeep(require("../services/BaseModel")), {
    schema: true,
    migrate: 'safe',

    attributes: {
        username: {
            type:       "string",
            required:   true,
            unique:     true
        },
        firstName: {
            type:       "string",
            required:   true
        },
        lastName: {
            type:       "string",
            required:   true
        },
        email: {
            type:       "email",
            required:   true,
            unique:     true
        },
        admin: {
            type:       "boolean",
            defaultsTo: false
        },
        password: {
            type:       "string",
            required:   false
        },
        language: {
            type:       "string",
            defaultsTo: "fi",
            required:   true
        },
        momentFormatDate: {
            type:       "string",
            defaultsTo: "L",
            required:   true
        },
        momentFormatTime: {
            type:       "string",
            defaultsTo: "LT",
            required:   true
        },
        momentFormatDateTime: {
            type:       "string",
            defaultsTo: "L LT",
            required:   true
        },
        momentTimezone: {
            type:       "string",
            defaultsTo: "Europe/Mariehamn",
            required:   true
        },
        taskTemplateChangeLimit: {
            type:       "integer",
            defaultsTo: 6,
            required:   true
        },
        boardSettingHideDoneStories: {
            type:       "boolean",
            defaultsTo: false,
            required:   true
        },
        sessionId: {
            type:       "string",
            defaultsTo: ""
        },

        // Below is all specification for relations to another models

        createdProjects: {
            collection: "Project",
            via: "createdUser"
        },
        updatedProjects: {
            collection: "Project",
            via: "updatedUser"
        },
        createdSprints: {
            collection: "Sprint",
            via: "createdUser"
        },
        updatedSprints: {
            collection: "Sprint",
            via: "updatedUser"
        },
        createdUsers: {
            collection: "User",
            via: "createdUser"
        },
        updatedUsers: {
            collection: "User",
            via: "updatedUser"
        },
        projectManager: {
            collection: "Project",
            via: "manager"
        },
        histories: {
            collection: "History",
            via: "user"
        },

        // Dynamic data attributes

        // Computed user fullName string
        fullName: function() {
            return this.lastName + " " + this.firstName;
        },

        // Gravatar image url
        gravatarImage: function(size) {
            size = size || 25;

            return gravatar.url(this.email, {s: size, r: "pg", d: "mm"}, true);
        },

        // Override toJSON instance method to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;
            delete obj.sessionId;

            return obj;
        },

        // Validate password
        validPassword: function(password, callback) {
            var obj = this.toObject();

            if (callback) {
                return bcrypt.compare(password, obj.password, callback);
            } else {
                return bcrypt.compareSync(password, obj.password);
            }
        }
    }
});

