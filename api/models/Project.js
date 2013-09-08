/**
 * Project
 *
 * @module      ::  Model
 * @description ::  This model represents project on taskboard.
 */
module.exports = {
    schema: true,
    attributes: {
        // Relation to User model
        managerId: {
            type:       'integer',
            required:   true
        },
        title: {
            type:       'string',
            required:   true,
            minLength:  5
        },
        description: {
            type:       'text',
            required:   true,
            defaultsTo: ''
        },
        dateStart: {
            type:       'date',
            required:   true
        },
        dateEnd: {
            type:       'date',
            required:   true
        },

        dateStartObject: function() {
            return new Date(this.dateStart);
        },
        dateEndObject: function() {
            return new Date(this.dateEnd);
        },
        dateStartFormatted: function() {
            return this.dateStartObject().format('isoDate');
        },
        dateEndFormatted: function() {
            return this.dateEndObject().format('isoDate');
        },

        objectTitle: function() {
            return this.title;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.project}   values
     * @param   {Function}              cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Project', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.project}   values
     * @param   {Function}              cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Project', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        Project
            .findOne(terms)
            .done(function(error, project) {
                HistoryService.remove('Project', project.id);

                cb();
            });
    }
};
