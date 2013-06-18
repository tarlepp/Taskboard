/*---------------------
    :: Task
    -> model
---------------------*/
module.exports = {
    attributes: {
        storyId: {
            type:       'integer',
            required:   'true'
        },
        userId: {
            type:       'integer',
            required:   'true'
        },
        phaseId: {
            type:       'integer',
            required:   'true',
            default:    0
        },
        typeId: {
            type:       'integer',
            required:   'true',
            default:    1
        },
        title: {
            type:       'string',
            required:   'true'
        },
        description: {
            type:       'string'
        }
    }
};