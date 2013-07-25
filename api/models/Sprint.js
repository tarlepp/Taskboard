/**
 * Sprint
 *
 * @module      ::  Model
 * @description ::  This model represents project sprint.
 */
module.exports = {
    attributes: {
        projectId: {
            type:       'integer',
            required:   true
        },
        title: {
            type:       'string',
            required:   true
        },
        description: {
            type:       'text'
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
        }
    },

    beforeDestroy: function(criteria, cb) {
        // Update all stories sprint id to 0
        Story.update(
            {sprintId: criteria},
            {sprintId: 0},
            function(err, stories) {
                if (err) {
                    // Todo how to handle errors in these?
                } else {
                    cb();
                }
            }
        );
    }
};
