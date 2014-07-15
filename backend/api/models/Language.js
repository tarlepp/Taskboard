'use strict';

var _ = require('lodash');

/**
 * Language.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        code: {
            type:       'string',
            required:   true
        },
        title: {
            type:       'string',
            required:   true
        }

        // Below is all specification for relations to another models

        // Dynamic data attributes
    },

    // Lifecycle Callbacks

    /**
     * Before validation callback.
     *
     * @param   {sails.model.comment}   values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    beforeValidate: function(values, next) {
        next();
    },

    /**
     * Before create callback.
     *
     * @param   {sails.model.comment}   values  Values to create
     * @param   {Function}              next    Callback function
     */
    beforeCreate: function(values, next) {
        next();
    },

    /**
     * Before update callback.
     *
     * @param   {sails.model.comment}   values  Values to update
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
     * @param   {sails.model.comment}   values  Values to create / update
     * @param   {Function}              next    Callback function
     */
    afterValidate: function(values, next) {
        next();
    },

    /**
     * After create callback.
     *
     * @param   {sails.model.comment}   record  Newly inserted record
     * @param   {Function}              next    Callback function
     */
    afterCreate: function(record, next) {
        next();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.comment}   record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        next();
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.comment[]} records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        next();
    }
});
