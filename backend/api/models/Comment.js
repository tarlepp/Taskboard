'use strict';

var _ = require('lodash');
var async = require('async');

/**
 * Comment.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */
module.exports = _.merge(_.cloneDeep(require('../base/Model')), {
    attributes: {
        // Name of the object where comment belongs to. eg. Story, Task, Project, Sprint, etc.
        objectName: {
            type:       'string',
            required:   true
        },
        // Object id
        objectId: {
            type:       'integer',
            required:   true
        },
        // Actual comment
        message: {
            type:       'text',
            required:   true
        },

        // Below is all specification for relations to another models

        // Parent comment object
        comment: {
            model:      'Comment',
            columnName: 'commentId',
            required:   true
        },
        // Collection of Comment objects that are attached to Comment
        comments: {
            collection: 'Comment',
            via:        'comment'
        }

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
        HistoryService.write('Comment', record, 'Added new comment', 0, next);
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.comment}   record  Updated record
     * @param   {Function}              next    Callback function
     */
    afterUpdate: function(record, next) {
        HistoryService.write('Comment', record, 'Updated comment data', 0, next);
    },

    /**
     * After destroy callback.
     *
     * @param   {sails.model.comment[]} records Destroyed records
     * @param   {Function}              next    Callback function
     */
    afterDestroy: function(records, next) {
        async.each(
            records,
            function(record, callback) {
                HistoryService.write('Comment', record, 'Removed comment', 0, callback);
            },
            function(error) {
                next(error);
            }
        );
    }
});
