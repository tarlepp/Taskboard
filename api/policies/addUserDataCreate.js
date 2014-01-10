// api/policies/addUserDataCreate.js

/**
 * Policy to set createdUserId and updatedUserId to body.
 *
 * @param   {Request}   request     Request object
 * @param   {Response}  response    Response object
 * @param   {Function}  next        Callback function to call if all is ok
 */
module.exports = function(request, response, next) {
    sails.log.verbose(" POLICY - api/policies/addUserDataCreate.js");

    if (!request.param("createdUserId")) {
        request.body.createdUserId = request.user.id;
    }

    if (!request.param("updatedUserId")) {
        request.body.updatedUserId = request.user.id;
    }

    next();
};