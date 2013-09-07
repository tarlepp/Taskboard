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
            return (this.deadline && this.deadline != '0000-00-00') ? new Date(this.deadline) : null;
        },
        deadlineFormatted: function() {
            return (this.deadline && this.deadline != '0000-00-00') ?  this.deadlineObject().format('isoDate') : '';
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.milestone} values
     * @param   {Function}              cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Milestone', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.milestone} values
     * @param   {Function}              cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Milestone', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Milestone
            .findOne(terms)
            .done(function(error, milestone) {
                HistoryService.remove('Milestone', milestone.id);

                cb();
            });
    }
};
