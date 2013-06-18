/*---------------------
    :: Sprint
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
        dateStart: {
            type:       'date',
            required:   'true'
        },
        dateEnd: {
            type:       'date',
            required:   'true'
        }
    }
};
