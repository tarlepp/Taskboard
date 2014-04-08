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

var _ = require("lodash");

module.exports = _.merge(_.cloneDeep(require("../services/baseModel")), {
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
        }
    },

    // Lifecycle callbacks

    /**
     * Before destroy callback, which will destroy all comment siblings.
     *
     * @param   {{}}        terms
     * @param   {Function}  next
     */
    beforeDestroy: function(terms, next) {
        // Fetch comment itself
        Comment
            .findOne(terms)
            .exec(function(error, comment) {
                if (error) {
                    next(error);
                } else if (comment) {
                    // Remove siblings
                    Comment
                        .destroy({commentId: comment.id})
                        .exec(function(error) {
                            next(error);
                        });
                } else {
                    next();
                }
            });
    }
});
