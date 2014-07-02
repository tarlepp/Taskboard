'use strict';

var _ = require('lodash');

/**
 * ProjectUser.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // User role in project; 0 = viewer, 1 = contributor, 2 = manager
        role: {
            type:       'integer',
            enum:       [0, 1, 2],
            defaultsTo: 0,
            required:   true
        },

        // Below is all specification for relations to another models

        // Relation to Project model
        project: {
            model:      'Project',
            columnName: 'projectId',
            required:   true
        },
        // Relation to User model
        user: {
            model:      'User',
            columnName: 'userId',
            required:   true
        }
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.projectUser}   values  Values to create / update
     * @param   {Function}                  next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.projectUser}   values  Values to create
     * @param   {Function}                  next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.projectUser}   values  Values to update
     * @param   {Function}                  next    Callback function
     */
    beforeUpdate: function(values, next) {
        next();
    },

    /**
     * Before destroy callback.
     *
     * @param   {{}}        criteria    Delete criteria
     * @param   {Function}  next        Callback function
     */
    beforeDestroy: function(criteria, next) {
        next();
    },

    /**
     * After validation callback.
     *
     * @param   {sails.model.projectUser}   values  Values to create / update
     * @param   {Function}                  next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.sprint}    record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.projectUser}   record  Updated record
     * @param   {Function}                  next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.projectUser[]} records Destroyed records
     * @param   {Function}                  next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});
