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

        objectTitle: function() {
            return this.title;
        },
        durationDays: function() {
            return this.dateStartObject().diff(this.dateEndObject(), "days");
        },
        dateStartObject: function() {
            return (this.dateStart && this.dateStart != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.dateStart) : null;
        },
        dateEndObject: function() {
            return (this.dateEnd && this.dateEnd != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.dateEnd) : null;
        },
        createdAtObject: function () {
            return (this.createdAt && this.createdAt != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.createdAt) : null;
        },
        updatedAtObject: function () {
            return (this.updatedAt && this.updatedAt != '0000-00-00')
                ? DateService.convertDateObjectToUtc(this.updatedAt) : null;
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
