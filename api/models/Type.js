/**
 * Type
 *
 * @module      ::  Model
 * @description ::  This model represent task types on taskboard. Basically this types are 'static':
 *                   - normal
 *                   - bug
 *                   - test
 */
module.exports = {
    attributes: {
        title: {
            type:       'string',
            required:   true
        },
        order: {
            type:       'integer',
            required:   true
        },
        class: {
            type:       'string',
            required:   true
        }
    }
};
