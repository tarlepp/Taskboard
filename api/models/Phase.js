/**
 * Phase
 *
 * @module      ::  Model
 * @description ::  This model represents project phases in taskboard. Note that all phases are
 *                  connected to specified project.
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
        order: {
            type:       'integer',
            required:   true,
            defaultsTo: 0
        },
        tasks: {
            type:       'integer',
            required:   true,
            defaultsTo: 0
        }
    }
};
