/**
 * Task
 *
 * @module      ::  Model
 * @description ::  Model represents single task on taskboard. Tasks are attached to specified user story, phase,
 *                  type and user.
 */
module.exports = {
    schema: true,
    attributes: {
        // Relation to Story model
        storyId: {
            type:       'integer',
            required:   true
        },
        // Relation to User model
        userId: {
            type:       'integer',
            defaultsTo: 0
        },
        // Relation to Phase model
        phaseId: {
            type:       'integer',
            required:   true,
            defaultsTo: 0
        },
        // Relation to Type model
        typeId: {
            type:       'integer',
            required:   true,
            defaultsTo: 1
        },
        title: {
            type:       'string',
            required:   true,
            minLength:  5
        },
        description: {
            type:       'text',
            defaultsTo: ''
        }
    }

    // TODO: add history data collection on create/update/delete
};
