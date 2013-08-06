/**
 * Story
 *
 * @module      ::  Model
 * @description ::  This model represent user story on taskboard. User stories are attached to project and
 *                  sprint. Sprint relation is not required, if sprintId is 0 or null current user story is
 *                  in project backlog.
 */
module.exports = {
    attributes: {
        projectId: {
            type:       'integer',
            required:   true
        },
        sprintId: {
            type:       'integer',
            defaultsTo: 0,
            required:   true
        },
        title: {
            type:       'string',
            required:   true
        },
        description: {
            type:       'text',
            required:   true
        },
        estimate: {
            type:       'integer',
            required:   true,
            defaultsTo: -1
        },
        priority: {
            type:       'integer'
        },
        vfCase: {
            type:       'integer',
            defaultsTo: 0
        },

        estimateFormatted: function() {
            return (this.estimate == -1) ? '???' : this.estimate;
        }
    },

    // Lifecycle Callbacks
    beforeCreate: function(values, cb) {
        Story
            .findOne({
                projectId: values.projectId,
                sprintId: values.sprintId
            })
            .sort('priority DESC')
            .done(function(error, story) {
                var priority;

                if (error) {
                    cb(error)
                } else if (!story) {
                    priority = 0;
                } else {
                    priority = story.priority + 1;
                }

                values.priority = priority;

                cb();
            });
    }
};
