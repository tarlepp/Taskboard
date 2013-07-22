/**
 * Story
 *
 * @module      ::  Model
 * @description ::  This model represent user story on taskboard. User stories are attached to project and
 *                  sprint. Sprint relation is not required, if sprintId is 0 or null current user story is
 *                  in project backlog.
 */
module.exports = {
    attributes: {
        projectId: {
            type:       'integer',
            required:   true
        },
        sprintId: {
            type:       'integer'
        },
        title: {
            type:       'string',
            required:   true
        },
        description: {
            type:       'text',
            required:   true
        },
        estimate: {
            type:       'integer',
            required:   true
        },
        priority: {
            type:       'integer'
        },
        vfCase: {
            type:       'integer'
        }
    }
};
