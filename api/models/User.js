/**
 * User
 *
 * @module      ::  Model
 * @description ::  Model to represents taskboard user.
 */
module.exports = {
    schema: true,
    attributes: {
        username: {
            type:       'string',
            required:   true
        },
        firstName: {
            type:       'string',
            required:   true
        },
        lastName: {
            type:       'string',
            required:   true
        },
        email: {
            type:       'email',
            required:   true,
            unique:     true
        },
        password: {
            type:       'string',
            required:   true
        },

        // Computed user fullName string
        fullName: function() {
            return this.lastName + ' ' + this.firstName;
        },

        // ObjectTitle
        objectTitle: function() {
            return this.lastName + ' ' + this.firstName;
        },

        // Override toJSON instance method to remove password value
        toJSON: function() {
            var obj = this.toObject();
            delete obj.password;

            return obj;
        }
    },

    // Life cycle callbacks

    /**
     * After create callback.
     *
     * @param   {sails.model.user}  values
     * @param   {Function}          cb
     */
    afterCreate: function(values, cb) {
        HistoryService.write('User', values);

        cb();
    },

    /**
     * After update callback.
     *
     * @param   {sails.model.user}  values
     * @param   {Function}          cb
     */
    afterUpdate: function(values, cb) {
        HistoryService.write('User', values);

        cb();
    },

    /**
     * Before destroy callback.
     *
     * @param   {Object}    terms
     * @param   {Function}  cb
     */
    beforeDestroy: function(terms, cb) {
        User
            .findOne(terms)
            .done(function(error, user) {
                HistoryService.remove('User', user.id);

                cb();
            });
    }
};
