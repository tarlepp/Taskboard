/*---------------------
    :: Project
    -> model
---------------------*/
module.exports = {
    attributes: {
        managerId: {
            type:       'integer',
            required:   'true'
        },
        title: {
            type:       'string',
            required:   'true'
        },
        description: {
            type:       'string',
            required:   'true'
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