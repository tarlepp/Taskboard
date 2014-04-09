/**
 * ProjectUser
 *
 * @module      ::  Model
 * @description ::  Model presents users that are attached to specified project in some role.
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
        // Relation to User model
        userId: {
            type:       "integer",
            required:   true
        },
        /**
         * User role in project:
         *  -1 = admin, he/she has _all_ rights
         *   0 = view only user, can only view data nothing else
         *   1 = normal user, can add and edit stories and tasks objects
         */
        role: {
            type:       "integer",
            defaultsTo: 0
        }
    }
});
