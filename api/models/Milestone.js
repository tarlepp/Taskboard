/**
 * Milestone
 *
 * @module      ::  Model
 * @description ::  This model represents project milestone in taskboard. Note that all milestones are
 *                  connected to specified project.
 *
 */
module.exports = {
    schema: true,
    attributes: {
        // Relation to Project model
        projectId: {
            type:       'integer',
            required:   true
        },
        title: {
            type:       'string',
            required:   true,
            minLength:  4
        },
        description: {
            type:       'text',
            defaultsTo: ''
        },
        deadline: {
            type:       'date'
        },

        deadlineObject: function() {
            return new Date(this.deadline);
        },
        deadlineFormatted: function() {
            return this.deadlineObject().format('isoDate');
        }
    }
};
