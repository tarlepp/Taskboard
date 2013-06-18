/*---------------------
    :: User
    -> model
---------------------*/
module.exports = {
    attributes: {
        name: {
            type:       'string',
            required:   'true'
        },
        firstname: {
            type:       'string',
            required:   'true'
        },
        surname: {
            type:       'string',
            required:   'true'
        },
        email: {
            type:       'email',
            required:   'true'
        }
    }
};