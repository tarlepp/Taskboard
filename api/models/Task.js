/**
 * Task
 *
 * @module      ::  Model
 * @description ::  Model represents single task on taskboard. Tasks are attached to specified user story, phase,
 *                  type and user.
 */
module.exports = {
    attributes: {
        storyId: {
            type:       'integer',
            required:   true
        },
        userId: {
            type:       'integer'
        },
        phaseId: {
            type:       'integer',
            required:   true,
            defaultsTo: 0
        },
        typeId: {
            type:       'integer',
            required:   true,
            defaultsTo: 1
        },
        title: {
            type:       'string',
            required:   true
        },
        description: {
            type:       'text'
        }
    }
};
