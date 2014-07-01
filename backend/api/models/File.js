'use strict';

var _ = require('lodash');

/**
 * File.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Name of the object where file belongs to. eg. Story, Task, Project, Sprint, etc.
        objectName: {
            type:       'string',
            required:   true
        },
        // Object id
        objectId: {
            type:       'integer',
            required:   true
        },
        // Filename
        filename: {
            type:       'string',
            required:   true
        },
        // Actual file content
        content: {
            type:       'binary',
            required:   true
        },
        // File size in bytes
        size: {
            type:       'integer',
            required:   true
        },
        // File mime type
        mimeType: {
            type:       'string',
            required:   true
        },
        // File description
        description: {
            type:       'text',
            defaultsTo: ''
        }

        // Below is all specification for relations to another models

        // Dynamic data attributes
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.file}      values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidation: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.file}      values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.file}      values  Values to update
     * @param   {Function}              next    Callback function
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
     * @param   {sails.model.file}      values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidation: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.file}      record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.file}      record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.file[]}    records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});
