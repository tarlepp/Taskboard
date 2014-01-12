/**
 * Comment
 *
 * @module      ::  Model
 * @description ::  Model to present comment object. This comment object can be attached to
 *                  any another object in Taskboard application. Also comment can be attached
 *                  to another comment. This allows comment threads.
 * @docs        ::  http://sailsjs.org/#!documentation/models
 */
"use strict";

module.exports = {
    schema: true,
    attributes: {
        objectName: {
            type:       "string",
            required:   true
        },
        objectId: {
            type:       "integer",
            required:   true
        },
        commentId: {
            type:       "integer",
            defaultsTo: 0
        },
        comment: {
            type:       "text",
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

        // Dynamic model data attributes

        createdAtObject: function () {
            return (this.createdAt && this.createdAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != "0000-00-00 00:00:00")
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
        }
    },

    // Lifecycle callbacks

    /**
     * Before destroy callback, which will destroy all comment siblings.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        // Fetch comment itself
        Comment
            .findOne(terms)
            .exec(function(error, comment) {
                if (error) {
                    cb(error);
                } else if (comment) {
                    // Remove all child
                    Comment
                        .destroy({commentId: comment.id})
                        .exec(function(error) {
                            cb(error);
                        });
                } else {
                    cb();
                }
            });
    }
};
