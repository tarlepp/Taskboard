/*---------------------
 :: Type
 -> model
 ---------------------*/
module.exports = {
    attributes: {
        title: {
            type:       'string',
            required:   'true'
        },
        order: {
            type:       'integer',
            required:   'true'
        },
        class: {
            type:       'string',
            required:   'true'
        }
    }
};