/*---------------------
    :: Phase
    -> model
---------------------*/
module.exports = {
    attributes: {
        projectId: {
            type:       'integer',
            required:   'true'
        },
        title: {
            type:       'string',
            required:   'true'
        },
        description: {
            type:       'string'
        },
        order: {
            type:       'integer',
            required:   'true'
        },
        tasks: {
            type:       'integer',
            required:   'true'
        }
    }
};