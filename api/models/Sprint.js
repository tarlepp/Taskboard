/**
 * Sprint
 *
 * @module      ::  Model
 * @description ::  This model represents project sprint.
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
            required:   true
        },
        description: {
            type:       'text',
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
        durationDates: function() {
            return this.dateStartFormatted() + " - " + this.dateEndFormatted();
        },
        durationDays: function() {
            return this.dateEndObject().getDate() - this.dateStartObject().getDate();
        },

        objectTitle: function() {
            return this.title;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.sprint}    values
     * @param   {Function}              cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('Sprint', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.sprint}    values
     * @param   {Function}              cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('Sprint', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        // Remove history data
        Sprint
            .findOne(terms)
            .done(function(error, sprint) {
                HistoryService.remove('Sprint', sprint.id);
            });

        // Update all stories sprint id to 0 which belongs to delete sprint
        Story.update(
            terms,
            {sprintId: 0},
            function(err, stories) {
                if (err) {
                    cb(err);
                } else {
                    cb();
                }
            }
        );
    }
};
