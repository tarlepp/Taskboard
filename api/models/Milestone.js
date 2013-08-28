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
            return this.deadline ? new Date(this.deadline) : this.deadline;
        },
        deadlineFormatted: function() {
            return this.deadline == null ? '' : this.deadlineObject().format('isoDate');
        },
        stories: function() {
            Story
                .find()
                .where({
                    milestoneId: this.id
                })
                .sort('title ASC')
                .exec(function(error, stories) {
                    return stories;
                });
        }
    }
};
