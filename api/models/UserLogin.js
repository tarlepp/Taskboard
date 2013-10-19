/**
 * UserLogin
 *
 * @module      ::  Model
 * @description ::  This model contains information about user login to Taskboard
 *
 */
module.exports = {
    schema: true,
    attributes: {
        userId: {
            type:   "integer"
        },
        ip: {
            type:   "string"
        },
        agent: {
            type:   "text"
        },
        stamp: {
            type:   "datetime"
        }
    }
};
