/**
 * Comment
 *
 * @module      :: Model
 * @description :: A short summary of how this model works and what it represents.
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

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
        Comment
            .findOne(terms)
            .exec(function(error, comment) {
                if (error) {
                    cb(error);
                } else if (comment) {
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
