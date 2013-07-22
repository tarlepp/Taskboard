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
        }
    }
};
