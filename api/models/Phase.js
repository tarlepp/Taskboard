/**
 * Phase
 *
 * @module      ::  Model
 * @description ::  This model represents project phases in taskboard. Note that all phases are
 *                  connected to specified project.
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
        order: {
            type:       'integer',
            defaultsTo: 0
        },
        // How many "tasks" is allowed to in this phase
        tasks: {
            type:       'integer',
            defaultsTo: 0
        },
        // If false, then in case of story splitting move phase tasks to new story
        isDone: {
            type:       'boolean',
            required:   true,
            defaultsTo: 0
        },

        objectTitle: function() {
            return this.title;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.phase}     values
     * @param   {Function}              cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Phase', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.phase}     values
     * @param   {Function}              cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Phase', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Phase
            .findOne(terms)
            .done(function(error, phase) {
                HistoryService.remove('Phase', phase.id);

                cb();
            });
    }
};
