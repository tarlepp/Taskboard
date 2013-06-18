/*---------------------
    :: Story
    -> model
---------------------*/
module.exports = {
    attributes: {
        projectId: {
            type:       'integer',
            required:   'true'
        },
        sprintId: {
            type:       'integer'
        },
        title: {
            type:       'string',
            required:   'true'
        },
        description: {
            type:       'string',
            required:   'true'
        },
        estimate: {
            type:       'integer',
            required:   'true'
        },
        priority: {
            type:       'integer'
        },
        vfCase: {
            type:       'integer'
        }
    }
};
