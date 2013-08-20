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
            required:   true,
            defaultsTo: 0
        },
        // How many "tasks" is allowed to in this phase
        tasks: {
            type:       'integer',
            required:   true,
            defaultsTo: 0
        },
        // If true, then in case of story splitting move phase tasks to new story
        split: {
            type:       'boolean',
            required:   true,
            defaultsTo: 0
        }
    }
};
