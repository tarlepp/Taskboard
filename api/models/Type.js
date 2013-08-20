/**
 * Type
 *
 * @module      ::  Model
 * @description ::  This model represent task types on taskboard. Basically this types are 'static':
 *                   - 1 = normal
 *                   - 2 = bug
 *                   - 3 = test
 */
module.exports = {
    schema: true,
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
